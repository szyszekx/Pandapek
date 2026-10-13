from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from app.database import engine
from app.auth import verify_api_key
from app.schemas import GameCreate, PaginatedGames
from typing import Literal

router = APIRouter(
    prefix="/api/games",
    tags=["Games"]
)

SortOption = Literal[
    "name-asc",
    "name-desc",
    "rating-asc",
    "rating-desc",
]



@router.get("", response_model=PaginatedGames)
def get_games(
    query: str | None = Query(default=None, max_length=100),
    page: int | None = Query(default=1, ge=1),
    limit: int | None = Query(default=25, ge=1, le=50) ,
    sort: SortOption = "name-asc",
    _: bool = Depends(verify_api_key),
    ):    
    
    sort_options = {
        "name-asc": "Nazwa ASC",
        "name-desc": "Nazwa DESC",
        "rating-asc": "srednia_ocen ASC",
        "rating-desc": "srednia_ocen DESC",
    }
    
    order_by = sort_options[sort]
    offset = (page-1)*limit

    parameters = {
        "limit": limit,
        "offset": offset,
    }

    where_clause = ""
    if query and query.strip():
        where_clause = f"WHERE Nazwa LIKE :query"
        parameters["query"] = f"%{query.strip()}%"

    with engine.connect() as connection:
        total = connection.execute(
            text(f"""
                 SELECT COUNT(*) 
                 FROM Gra 
                 {where_clause}
            """),
            parameters
        ).scalar_one()

        result = connection.execute(
            text(f"""
                SELECT
                    id_Gra,
                    Nazwa,
                    Opis,
                    Producent,
                    Wydawca,
                    gatunek,
                    data_premiery,
                    kategoriaWiekowa,
                    srednia_ocen,
                    app_id
                FROM Gra
                {where_clause}
                ORDER BY {order_by}, id_Gra ASC
                LIMIT :limit OFFSET :offset
            """),
            parameters
        )
        games = [dict(row) for row in result.mappings()]

        return {
            "items": games,
            "total": total, 
            "page": page, 
            "limit": limit, 
            "total_pages": (total + limit - 1) // limit}


@router.get("/{game_id}")
def get_game(
    game_id: int,
    _: bool = Depends(verify_api_key)
):
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT
                    id_Gra,
                    Nazwa,
                    Opis,
                    Producent,
                    Wydawca,
                    gatunek,
                    data_premiery,
                    kategoriaWiekowa,
                    srednia_ocen,
                    app_id
                FROM Gra
                WHERE id_Gra = :game_id
            """),
            {"game_id": game_id}
        )

        game = result.mappings().first()

    if game is None:
        raise HTTPException(
            status_code=404,
            detail="Game not found"
        )

    return dict(game)


@router.post("")
def create_game(
    game: GameCreate,
    _: bool = Depends(verify_api_key)
):
    with engine.begin() as connection:
        existing = connection.execute(
            text("""
                SELECT id_Gra
                FROM Gra
                WHERE id_Gra = :id_Gra
            """),
            {"id_Gra": game.id_Gra}
        ).first()

        if existing:
            raise HTTPException(
                status_code=409,
                detail="Game with this ID already exists"
            )

        connection.execute(
            text("""
                INSERT INTO Gra (
                    id_Gra,
                    Nazwa,
                    Opis,
                    Producent,
                    Wydawca,
                    gatunek,
                    data_premiery,
                    kategoriaWiekowa,
                    srednia_ocen,
                    app_id
                )
                VALUES (
                    :id_Gra,
                    :Nazwa,
                    :Opis,
                    :Producent,
                    :Wydawca,
                    :gatunek,
                    :data_premiery,
                    :kategoriaWiekowa,
                    :srednia_ocen,
                    :app_id
                )
            """),
            game.model_dump()
        )

    return {
        "message": "Game created",
        "id_Gra": game.id_Gra
    }


@router.put("/{game_id}")
def update_game(
    game_id: int,
    game: GameCreate,
    _: bool = Depends(verify_api_key)
):
    if game_id != game.id_Gra:
        raise HTTPException(
            status_code=400,
            detail="ID in URL and body must be the same"
        )

    with engine.begin() as connection:
        existing = connection.execute(
            text("""
                SELECT id_Gra
                FROM Gra
                WHERE id_Gra = :game_id
            """),
            {"game_id": game_id}
        ).first()

        if existing is None:
            raise HTTPException(
                status_code=404,
                detail="Game not found"
            )

        connection.execute(
            text("""
                UPDATE Gra
                SET
                    Nazwa = :Nazwa,
                    Opis = :Opis,
                    Producent = :Producent,
                    Wydawca = :Wydawca,
                    gatunek = :gatunek,
                    data_premiery = :data_premiery,
                    kategoriaWiekowa = :kategoriaWiekowa,
                    srednia_ocen = :srednia_ocen
                WHERE id_Gra = :id_Gra
            """),
            game.model_dump()
        )

    return {
        "message": "Game updated",
        "id_Gra": game_id
    }


@router.delete("/{game_id}")
def delete_game(
    game_id: int,
    _: bool = Depends(verify_api_key)
):
    with engine.begin() as connection:
        existing = connection.execute(
            text("""
                SELECT id_Gra
                FROM Gra
                WHERE id_Gra = :game_id
            """),
            {"game_id": game_id}
        ).first()

        if existing is None:
            raise HTTPException(
                status_code=404,
                detail="Game not found"
            )

        connection.execute(
            text("""
                DELETE FROM Gra
                WHERE id_Gra = :game_id
            """),
            {"game_id": game_id}
        )

    return {
        "message": "Game deleted",
        "id_Gra": game_id
    }