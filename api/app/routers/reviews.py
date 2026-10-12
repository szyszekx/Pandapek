import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from app.database import engine
from app.auth import verify_api_key
from app.schemas import ReviewCreate


router = APIRouter(
    prefix="/api/reviews",
    tags=["Reviews"]
)


@router.get("")
def get_reviews(_: bool = Depends(verify_api_key)):
    """Pobiera wszystkie opinie."""
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT
                    Id_Opinia,
                    id_User,
                    id_Gra,
                    Tresc,
                    Ocena,
                    czy_poleca,
                    czas_gry,
                    liczba_polubien,
                    data_dodania,
                    czy_edytowano,
                    data_edycji
                FROM Opinia
            """)
        )

        return [dict(row) for row in result.mappings()]



@router.get("/ocena/{ocena}")
def get_opinie_by_ocena(
    ocena: int,
    _: bool = Depends(verify_api_key)
):
    """Pobiera opinie filtrowane po ocenie."""
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT
                    Id_Opinia, id_User, id_Gra, Tresc, Ocena,
                    czy_poleca, czas_gry, liczba_polubien,
                    data_dodania, czy_edytowano, data_edycji
                FROM Opinia
                WHERE Ocena = :ocena
            """),
            {"ocena": ocena}
        )
        return [dict(row) for row in result.mappings()]


@router.get("/polecane/{czy_poleca}")
def get_opinie_by_poleca(
    czy_poleca: bool,
    _: bool = Depends(verify_api_key)
):
    """Pobiera opinie filtrowane po rekomendacji (True/False)."""
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT
                    Id_Opinia, id_User, id_Gra, Tresc, Ocena,
                    czy_poleca, czas_gry, liczba_polubien,
                    data_dodania, czy_edytowano, data_edycji
                FROM Opinia
                WHERE czy_poleca = :czy_poleca
            """),
            {"czy_poleca": czy_poleca}
        )
        return [dict(row) for row in result.mappings()]


@router.get("/czas-gry/{min_czas}")
def get_opinie_by_czas(
    min_czas: float,
    _: bool = Depends(verify_api_key)
):
    """Pobiera opinie filtrowane po minimalnym czasie gry."""
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT
                    Id_Opinia, id_User, id_Gra, Tresc, Ocena,
                    czy_poleca, czas_gry, liczba_polubien,
                    data_dodania, czy_edytowano, data_edycji
                FROM Opinia
                WHERE czas_gry >= :min_czas
            """),
            {"min_czas": min_czas}
        )
        return [dict(row) for row in result.mappings()]


@router.get("/uzytkownik/{user_id}")
def get_opinie_by_user(
    user_id: int,
    _: bool = Depends(verify_api_key)
):
    """Pobiera opinie dla konkretnego użytkownika."""
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT
                    Id_Opinia, id_User, id_Gra, Tresc, Ocena,
                    czy_poleca, czas_gry, liczba_polubien,
                    data_dodania, czy_edytowano, data_edycji
                FROM Opinia
                WHERE id_User = :user_id
            """),
            {"user_id": user_id}
        )
        return [dict(row) for row in result.mappings()]


@router.get("/gra/{game_id}")
def get_opinie_by_game(
    game_id: int,
    _: bool = Depends(verify_api_key)
):
    """Pobiera opinie dla konkretnej gry."""
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT
                    Id_Opinia, id_User, id_Gra, Tresc, Ocena,
                    czy_poleca, czas_gry, liczba_polubien,
                    data_dodania, czy_edytowano, data_edycji
                FROM Opinia
                WHERE id_Gra = :game_id
            """),
            {"game_id": game_id}
        )
        return [dict(row) for row in result.mappings()]


# --- ENDPOINTY ZWIĄZANE Z KONKRETNYM ID OPINII ---

@router.get("/{review_id}")
def get_review(
    review_id: int,
    _: bool = Depends(verify_api_key)
):
    """Pobiera pojedynczą opinię po ID."""
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT
                    Id_Opinia,
                    id_User,
                    id_Gra,
                    Tresc,
                    Ocena,
                    czy_poleca,
                    czas_gry,
                    liczba_polubien,
                    data_dodania,
                    czy_edytowano,
                    data_edycji
                FROM Opinia
                WHERE Id_Opinia = :review_id
            """),
            {"review_id": review_id}
        )

        review = result.mappings().first()

    if review is None:
        raise HTTPException(
            status_code=404,
            detail="Review not found"
        )

    return dict(review)


@router.post("")
def create_review(
    review: ReviewCreate,
    _: bool = Depends(verify_api_key)
):
    """Tworzy nową opinię."""
    with engine.begin() as connection:
        existing = connection.execute(
            text("""
                SELECT Id_Opinia
                FROM Opinia
                WHERE Id_Opinia = :Id_Opinia
            """),
            {"Id_Opinia": review.Id_Opinia}
        ).first()

        if existing:
            raise HTTPException(
                status_code=409,
                detail="Review with this ID already exists"
            )

        connection.execute(
            text("""
                INSERT INTO Opinia (
                    Id_Opinia,
                    id_User,
                    id_Gra,
                    Tresc,
                    Ocena,
                    czy_poleca,
                    czas_gry,
                    liczba_polubien,
                    data_dodania,
                    czy_edytowano,
                    data_edycji
                )
                VALUES (
                    :Id_Opinia,
                    :id_User,
                    :id_Gra,
                    :Tresc,
                    :Ocena,
                    :czy_poleca,
                    :czas_gry,
                    :liczba_polubien,
                    :data_dodania,
                    :czy_edytowano,
                    :data_edycji
                )
            """),
            review.model_dump()
        )

    return {
        "message": "Review created",
        "Id_Opinia": review.Id_Opinia
    }


@router.post("/{review_id}/like")
def add_like(
    review_id: int,
    _: bool = Depends(verify_api_key)
):
    """Dodaje polubienie do opinii (zwiększa liczbę polubień o 1)."""
    with engine.begin() as connection:
        existing = connection.execute(
            text("SELECT Id_Opinia, liczba_polubien FROM Opinia WHERE Id_Opinia = :review_id"),
            {"review_id": review_id}
        ).mappings().first()

        if existing is None:
            raise HTTPException(status_code=404, detail="Review not found")

        new_likes = existing["liczba_polubien"] + 1

        connection.execute(
            text("""
                UPDATE Opinia
                SET liczba_polubien = :new_likes
                WHERE Id_Opinia = :review_id
            """),
            {"new_likes": new_likes, "review_id": review_id}
        )

        updated = connection.execute(
            text("""
                SELECT
                    Id_Opinia, id_User, id_Gra, Tresc, Ocena,
                    czy_poleca, czas_gry, liczba_polubien,
                    data_dodania, czy_edytowano, data_edycji
                FROM Opinia
                WHERE Id_Opinia = :review_id
            """),
            {"review_id": review_id}
        ).mappings().first()

    return dict(updated)


@router.put("/{review_id}/tresc")
def update_tresc(
    review_id: int,
    nowa_tresc: str,
    _: bool = Depends(verify_api_key)
):
    """Aktualizuje samą treść opinii (oznacza jako edytowaną i ustawia dzisiejszą datę edycji)."""
    current_date = datetime.date.today().isoformat()
    with engine.begin() as connection:
        existing = connection.execute(
            text("SELECT Id_Opinia FROM Opinia WHERE Id_Opinia = :review_id"),
            {"review_id": review_id}
        ).first()

        if existing is None:
            raise HTTPException(status_code=404, detail="Review not found")

        connection.execute(
            text("""
                UPDATE Opinia
                SET Tresc = :nowa_tresc,
                    czy_edytowano = :czy_edytowano,
                    data_edycji = :data_edycji
                WHERE Id_Opinia = :review_id
            """),
            {
                "nowa_tresc": nowa_tresc,
                "czy_edytowano": True,
                "data_edycji": current_date,
                "review_id": review_id
            }
        )

        updated = connection.execute(
            text("""
                SELECT
                    Id_Opinia, id_User, id_Gra, Tresc, Ocena,
                    czy_poleca, czas_gry, liczba_polubien,
                    data_dodania, czy_edytowano, data_edycji
                FROM Opinia
                WHERE Id_Opinia = :review_id
            """),
            {"review_id": review_id}
        ).mappings().first()

    return dict(updated)


@router.put("/{review_id}")
def update_review(
    review_id: int,
    review: ReviewCreate,
    _: bool = Depends(verify_api_key)
):
    """Aktualizuje całą opinię."""
    if review_id != review.Id_Opinia:
        raise HTTPException(
            status_code=400,
            detail="ID in URL and body must be the same"
        )

    with engine.begin() as connection:
        existing = connection.execute(
            text("""
                SELECT Id_Opinia
                FROM Opinia
                WHERE Id_Opinia = :review_id
            """),
            {"review_id": review_id}
        ).first()

        if existing is None:
            raise HTTPException(
                status_code=404,
                detail="Review not found"
            )

        connection.execute(
            text("""
                UPDATE Opinia
                SET
                    id_User = :id_User,
                    id_Gra = :id_Gra,
                    Tresc = :Tresc,
                    Ocena = :Ocena,
                    czy_poleca = :czy_poleca,
                    czas_gry = :czas_gry,
                    liczba_polubien = :liczba_polubien,
                    data_dodania = :data_dodania,
                    czy_edytowano = :czy_edytowano,
                    data_edycji = :data_edycji
                WHERE Id_Opinia = :Id_Opinia
            """),
            review.model_dump()
        )

    return {
        "message": "Review updated",
        "Id_Opinia": review_id
    }


@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    _: bool = Depends(verify_api_key)
):
    """Usuwa opinię po ID."""
    with engine.begin() as connection:
        existing = connection.execute(
            text("""
                SELECT Id_Opinia
                FROM Opinia
                WHERE Id_Opinia = :review_id
            """),
            {"review_id": review_id}
        ).first()

        if existing is None:
            raise HTTPException(
                status_code=404,
                detail="Review not found"
            )

        connection.execute(
            text("""
                DELETE FROM Opinia
                WHERE Id_Opinia = :review_id
            """),
            {"review_id": review_id}
        )

    return {
        "message": "Review deleted",
        "Id_Opinia": review_id
    }