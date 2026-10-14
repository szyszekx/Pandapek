from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from app.database import engine
from app.auth import verify_api_key
from app.schemas import LibraryCreate


router = APIRouter(
    prefix="/api/library",
    tags=["Library"]
)


@router.get("")
def get_library(_: bool = Depends(verify_api_key)):
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT
                    id_biblioteki,
                    id_User,
                    id_Gra,
                    id_Platformy
                FROM Biblioteka_uzyt
            """)
        )

        return [dict(row) for row in result.mappings()]

@router.get("/check/{user}/{game}")
def get_library(
    user: int,
    game: int,
    _: bool = Depends(verify_api_key)):
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT
                    id_biblioteki,
                    id_User,
                    id_Gra,
                    id_Platformy
                FROM Biblioteka_uzyt
                WHERE id_User = :user AND
                id_Gra = :game
            """),
            {"user": f"{user}","game": f"{game}"}
        ).mappings().first()

        return {
            "inLibrary": bool(result)
        }

@router.get("/users/{user}")
def get_library(
    user: int,
    _: bool = Depends(verify_api_key)):
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT
                    id_biblioteki,
                    id_User,
                    id_Gra,
                    id_Platformy
                FROM Biblioteka_uzyt
                WHERE id_User = :user
            """),
            {"user": f"{user}"}
        ).mappings().all()

        return [dict(row) for row in result]


@router.get("/{library_id}")
def get_library_entry(
    library_id: int,
    _: bool = Depends(verify_api_key)
):
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT
                    id_biblioteki,
                    id_User,
                    id_Gra,
                    id_Platformy
                FROM Biblioteka_uzyt
                WHERE id_biblioteki = :library_id
            """),
            {"library_id": library_id}
        )

        entry = result.mappings().first()

    if entry is None:
        raise HTTPException(
            status_code=404,
            detail="Library entry not found"
        )

    return dict(entry)


@router.post("")
def create_library_entry(
    entry: LibraryCreate,
    _: bool = Depends(verify_api_key)
):
    with engine.begin() as connection:
        existing = connection.execute(
            text("""
                SELECT id_biblioteki
                FROM Biblioteka_uzyt
                WHERE id_biblioteki = :id_biblioteki
            """),
            {"id_biblioteki": entry.id_biblioteki}
        ).first()

        if existing:
            raise HTTPException(
                status_code=409,
                detail="Library entry with this ID already exists"
            )

        connection.execute(
            text("""
                INSERT INTO Biblioteka_uzyt (
                    id_User,
                    id_Gra,
                    id_Platformy
                )
                VALUES (
                    :id_User,
                    :id_Gra,
                    :id_Platformy
                )
            """),
            entry.model_dump()
        )

    return {
        "message": "Library entry created",
        "id_biblioteki": entry.id_biblioteki
    }


@router.put("/{library_id}")
def update_library_entry(
    library_id: int,
    entry: LibraryCreate,
    _: bool = Depends(verify_api_key)
):
    if library_id != entry.id_biblioteki:
        raise HTTPException(
            status_code=400,
            detail="ID in URL and body must be the same"
        )

    with engine.begin() as connection:
        existing = connection.execute(
            text("""
                SELECT id_biblioteki
                FROM Biblioteka_uzyt
                WHERE id_biblioteki = :library_id
            """),
            {"library_id": library_id}
        ).first()

        if existing is None:
            raise HTTPException(
                status_code=404,
                detail="Library entry not found"
            )

        connection.execute(
            text("""
                UPDATE Biblioteka_uzyt
                SET
                    id_User = :id_User,
                    id_Gra = :id_Gra,
                    id_Platformy = :id_Platformy
                WHERE id_biblioteki = :id_biblioteki
            """),
            entry.model_dump()
        )

    return {
        "message": "Library entry updated",
        "id_biblioteki": library_id
    }


@router.delete("/{library_id}")
def delete_library_entry(
    library_id: int,
    _: bool = Depends(verify_api_key)
):
    with engine.begin() as connection:
        existing = connection.execute(
            text("""
                SELECT id_biblioteki
                FROM Biblioteka_uzyt
                WHERE id_biblioteki = :library_id
            """),
            {"library_id": library_id}
        ).first()

        if existing is None:
            raise HTTPException(
                status_code=404,
                detail="Library entry not found"
            )

        connection.execute(
            text("""
                DELETE FROM Biblioteka_uzyt
                WHERE id_biblioteki = :library_id
            """),
            {"library_id": library_id}
        )

    return {
        "message": "Library entry deleted",
        "id_biblioteki": library_id
    }