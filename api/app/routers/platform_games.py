from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from app.database import engine
from app.auth import verify_api_key
from app.schemas import PlatformGameCreate


router = APIRouter(
    prefix="/api/platform-games",
    tags=["Platform Games"]
)


@router.get("")
def get_platform_games(_: bool = Depends(verify_api_key)):
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT
                    id_platformy,
                    id_gra,
                    cena
                FROM Platforma_gra
            """)
        )

        return [dict(row) for row in result.mappings()]


@router.get("/{platform_id}/{game_id}")
def get_platform_game(
    platform_id: int,
    game_id: int,
    _: bool = Depends(verify_api_key)
):
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT
                    id_platformy,
                    id_gra,
                    cena
                FROM Platforma_gra
                WHERE id_platformy = :platform_id
                  AND id_gra = :game_id
            """),
            {
                "platform_id": platform_id,
                "game_id": game_id
            }
        )

        platform_game = result.mappings().first()

    if platform_game is None:
        raise HTTPException(
            status_code=404,
            detail="Platform-game relation not found"
        )

    return dict(platform_game)


@router.post("")
def create_platform_game(
    platform_game: PlatformGameCreate,
    _: bool = Depends(verify_api_key)
):
    with engine.begin() as connection:
        existing = connection.execute(
            text("""
                SELECT id_platformy, id_gra
                FROM Platforma_gra
                WHERE id_platformy = :id_platformy
                  AND id_gra = :id_gra
            """),
            {
                "id_platformy": platform_game.id_platformy,
                "id_gra": platform_game.id_gra
            }
        ).first()

        if existing:
            raise HTTPException(
                status_code=409,
                detail="This platform-game relation already exists"
            )

        connection.execute(
            text("""
                INSERT INTO Platforma_gra (
                    id_platformy,
                    id_gra,
                    cena
                )
                VALUES (
                    :id_platformy,
                    :id_gra,
                    :cena
                )
            """),
            platform_game.model_dump()
        )

    return {
        "message": "Platform-game relation created",
        "id_platformy": platform_game.id_platformy,
        "id_gra": platform_game.id_gra
    }


@router.put("/{platform_id}/{game_id}")
def update_platform_game(
    platform_id: int,
    game_id: int,
    platform_game: PlatformGameCreate,
    _: bool = Depends(verify_api_key)
):
    if (
        platform_id != platform_game.id_platformy
        or game_id != platform_game.id_gra
    ):
        raise HTTPException(
            status_code=400,
            detail="IDs in URL and body must be the same"
        )

    with engine.begin() as connection:
        existing = connection.execute(
            text("""
                SELECT id_platformy, id_gra
                FROM Platforma_gra
                WHERE id_platformy = :platform_id
                  AND id_gra = :game_id
            """),
            {
                "platform_id": platform_id,
                "game_id": game_id
            }
        ).first()

        if existing is None:
            raise HTTPException(
                status_code=404,
                detail="Platform-game relation not found"
            )

        connection.execute(
            text("""
                UPDATE Platforma_gra
                SET cena = :cena
                WHERE id_platformy = :id_platformy
                  AND id_gra = :id_gra
            """),
            platform_game.model_dump()
        )

    return {
        "message": "Platform-game relation updated",
        "id_platformy": platform_id,
        "id_gra": game_id
    }


@router.delete("/{platform_id}/{game_id}")
def delete_platform_game(
    platform_id: int,
    game_id: int,
    _: bool = Depends(verify_api_key)
):
    with engine.begin() as connection:
        existing = connection.execute(
            text("""
                SELECT id_platformy, id_gra
                FROM Platforma_gra
                WHERE id_platformy = :platform_id
                  AND id_gra = :game_id
            """),
            {
                "platform_id": platform_id,
                "game_id": game_id
            }
        ).first()

        if existing is None:
            raise HTTPException(
                status_code=404,
                detail="Platform-game relation not found"
            )

        connection.execute(
            text("""
                DELETE FROM Platforma_gra
                WHERE id_platformy = :platform_id
                  AND id_gra = :game_id
            """),
            {
                "platform_id": platform_id,
                "game_id": game_id
            }
        )

    return {
        "message": "Platform-game relation deleted",
        "id_platformy": platform_id,
        "id_gra": game_id
    }