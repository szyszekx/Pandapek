from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from app.database import engine
from app.auth import verify_api_key
from app.schemas import UserCreate


router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)


@router.get("")
def get_users(_: bool = Depends(verify_api_key)):
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT
                    id_User,
                    login,
                    haslo,
                    data_zalozenia
                FROM User
            """)
        )

        return [dict(row) for row in result.mappings()]


@router.get("/{user_id}")
def get_user(
    user_id: int,
    _: bool = Depends(verify_api_key)
):
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT
                    id_User,
                    login,
                    haslo,
                    data_zalozenia
                FROM User
                WHERE id_User = :user_id
            """),
            {"user_id": user_id}
        )

        user = result.mappings().first()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return dict(user)

@router.get("/steam/{login}")
def get_user(
    login: int,
    _: bool = Depends(verify_api_key)
):
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT
                    id_User,
                    login,
                    haslo,
                    data_zalozenia
                FROM User
                WHERE login = :login
            """),
            {"login": login}
        )

        user = result.mappings().first()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return dict(user)


@router.post("")
def create_user(
    user: UserCreate,
    _: bool = Depends(verify_api_key)
):
    with engine.begin() as connection:
        existing_id = connection.execute(
            text("""
                SELECT id_User
                FROM User
                WHERE id_User = :id_User
            """),
            {"id_User": user.id_User}
        ).first()

        if existing_id:
            raise HTTPException(
                status_code=409,
                detail="User with this ID already exists"
            )

        existing_login = connection.execute(
            text("""
                SELECT id_User
                FROM User
                WHERE login = :login
            """),
            {"login": user.login}
        ).first()

        if existing_login:
            raise HTTPException(
                status_code=409,
                detail="User with this login already exists"
            )

        connection.execute(
            text("""
                INSERT INTO User (
                    login,
                    haslo,
                    data_zalozenia
                )
                VALUES (
                    :login,
                    :haslo,
                    :data_zalozenia
                )
            """),
            user.model_dump()
        )

    return {
        "message": "User created",
        "id_User": user.id_User
    }


@router.put("/{user_id}")
def update_user(
    user_id: int,
    user: UserCreate,
    _: bool = Depends(verify_api_key)
):
    if user_id != user.id_User:
        raise HTTPException(
            status_code=400,
            detail="ID in URL and body must be the same"
        )

    with engine.begin() as connection:
        existing = connection.execute(
            text("""
                SELECT id_User
                FROM User
                WHERE id_User = :user_id
            """),
            {"user_id": user_id}
        ).first()

        if existing is None:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        connection.execute(
            text("""
                UPDATE User
                SET
                    login = :login,
                    haslo = :haslo,
                    data_zalozenia = :data_zalozenia
                WHERE id_User = :id_User
            """),
            user.model_dump()
        )

    return {
        "message": "User updated",
        "id_User": user_id
    }


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    _: bool = Depends(verify_api_key)
):
    with engine.begin() as connection:
        existing = connection.execute(
            text("""
                SELECT id_User
                FROM User
                WHERE id_User = :user_id
            """),
            {"user_id": user_id}
        ).first()

        if existing is None:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        connection.execute(
            text("""
                DELETE FROM User
                WHERE id_User = :user_id
            """),
            {"user_id": user_id}
        )

    return {
        "message": "User deleted",
        "id_User": user_id
    }