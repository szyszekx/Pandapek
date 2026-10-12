from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from app.database import engine
from app.auth import verify_api_key
from app.schemas import PlatformCreate


router = APIRouter(
    prefix="/api/platforms",
    tags=["Platforms"]
)


@router.get("")
def get_platforms(_: bool = Depends(verify_api_key)):
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT
                    id_Platformy,
                    Nazwa,
                    opis
                FROM Platforma
            """)
        )

        return [dict(row) for row in result.mappings()]


@router.get("/{platform_id}")
def get_platform(
    platform_id: int,
    _: bool = Depends(verify_api_key)
):
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT
                    id_Platformy,
                    Nazwa,
                    opis
                FROM Platforma
                WHERE id_Platformy = :platform_id
            """),
            {"platform_id": platform_id}
        )

        platform = result.mappings().first()

    if platform is None:
        raise HTTPException(
            status_code=404,
            detail="Platform not found"
        )

    return dict(platform)


@router.post("")
def create_platform(
    platform: PlatformCreate,
    _: bool = Depends(verify_api_key)
):
    with engine.begin() as connection:
        existing = connection.execute(
            text("""
                SELECT id_Platformy
                FROM Platforma
                WHERE id_Platformy = :id_Platformy
            """),
            {"id_Platformy": platform.id_Platformy}
        ).first()

        if existing:
            raise HTTPException(
                status_code=409,
                detail="Platform with this ID already exists"
            )

        connection.execute(
            text("""
                INSERT INTO Platforma (
                    id_Platformy,
                    Nazwa,
                    opis
                )
                VALUES (
                    :id_Platformy,
                    :Nazwa,
                    :opis
                )
            """),
            platform.model_dump()
        )

    return {
        "message": "Platform created",
        "id_Platformy": platform.id_Platformy
    }


@router.put("/{platform_id}")
def update_platform(
    platform_id: int,
    platform: PlatformCreate,
    _: bool = Depends(verify_api_key)
):
    if platform_id != platform.id_Platformy:
        raise HTTPException(
            status_code=400,
            detail="ID in URL and body must be the same"
        )

    with engine.begin() as connection:
        existing = connection.execute(
            text("""
                SELECT id_Platformy
                FROM Platforma
                WHERE id_Platformy = :platform_id
            """),
            {"platform_id": platform_id}
        ).first()

        if existing is None:
            raise HTTPException(
                status_code=404,
                detail="Platform not found"
            )

        connection.execute(
            text("""
                UPDATE Platforma
                SET
                    Nazwa = :Nazwa,
                    opis = :opis
                WHERE id_Platformy = :id_Platformy
            """),
            platform.model_dump()
        )

    return {
        "message": "Platform updated",
        "id_Platformy": platform_id
    }


@router.delete("/{platform_id}")
def delete_platform(
    platform_id: int,
    _: bool = Depends(verify_api_key)
):
    with engine.begin() as connection:
        existing = connection.execute(
            text("""
                SELECT id_Platformy
                FROM Platforma
                WHERE id_Platformy = :platform_id
            """),
            {"platform_id": platform_id}
        ).first()

        if existing is None:
            raise HTTPException(
                status_code=404,
                detail="Platform not found"
            )

        connection.execute(
            text("""
                DELETE FROM Platforma
                WHERE id_Platformy = :platform_id
            """),
            {"platform_id": platform_id}
        )

    return {
        "message": "Platform deleted",
        "id_Platformy": platform_id
    }