from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from app.database import engine
from app.auth import verify_api_key
from app.schemas import AccountLinkCreate


router = APIRouter(
    prefix="/api/account-links",
    tags=["Account Links"]
)


@router.get("")
def get_account_links(_: bool = Depends(verify_api_key)):
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT
                    id_User,
                    id_Platformy,
                    id_zewnetrzne
                FROM PowiazanieKonta
            """)
        )

        return [dict(row) for row in result.mappings()]


@router.get("/{user_id}/{platform_id}")
def get_account_link(
    user_id: int,
    platform_id: int,
    _: bool = Depends(verify_api_key)
):
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT
                    id_User,
                    id_Platformy,
                    id_zewnetrzne
                FROM PowiazanieKonta
                WHERE id_User = :user_id
                  AND id_Platformy = :platform_id
            """),
            {
                "user_id": user_id,
                "platform_id": platform_id
            }
        )

        link = result.mappings().first()

    if link is None:
        raise HTTPException(
            status_code=404,
            detail="Account link not found"
        )

    return dict(link)


@router.post("")
def create_account_link(
    link: AccountLinkCreate,
    _: bool = Depends(verify_api_key)
):
    with engine.begin() as connection:
        existing = connection.execute(
            text("""
                SELECT id_User, id_Platformy
                FROM PowiazanieKonta
                WHERE id_User = :id_User
                  AND id_Platformy = :id_Platformy
            """),
            {
                "id_User": link.id_User,
                "id_Platformy": link.id_Platformy
            }
        ).first()

        if existing:
            raise HTTPException(
                status_code=409,
                detail="This account link already exists"
            )

        connection.execute(
            text("""
                INSERT INTO PowiazanieKonta (
                    id_User,
                    id_Platformy,
                    id_zewnetrzne
                )
                VALUES (
                    :id_User,
                    :id_Platformy,
                    :id_zewnetrzne
                )
            """),
            link.model_dump()
        )

    return {
        "message": "Account link created",
        "id_User": link.id_User,
        "id_Platformy": link.id_Platformy
    }


@router.put("/{user_id}/{platform_id}")
def update_account_link(
    user_id: int,
    platform_id: int,
    link: AccountLinkCreate,
    _: bool = Depends(verify_api_key)
):
    if user_id != link.id_User or platform_id != link.id_Platformy:
        raise HTTPException(
            status_code=400,
            detail="IDs in URL and body must be the same"
        )

    with engine.begin() as connection:
        existing = connection.execute(
            text("""
                SELECT id_User, id_Platformy
                FROM PowiazanieKonta
                WHERE id_User = :user_id
                  AND id_Platformy = :platform_id
            """),
            {
                "user_id": user_id,
                "platform_id": platform_id
            }
        ).first()

        if existing is None:
            raise HTTPException(
                status_code=404,
                detail="Account link not found"
            )

        connection.execute(
            text("""
                UPDATE PowiazanieKonta
                SET id_zewnetrzne = :id_zewnetrzne
                WHERE id_User = :id_User
                  AND id_Platformy = :id_Platformy
            """),
            link.model_dump()
        )

    return {
        "message": "Account link updated",
        "id_User": user_id,
        "id_Platformy": platform_id
    }


@router.delete("/{user_id}/{platform_id}")
def delete_account_link(
    user_id: int,
    platform_id: int,
    _: bool = Depends(verify_api_key)
):
    with engine.begin() as connection:
        existing = connection.execute(
            text("""
                SELECT id_User, id_Platformy
                FROM PowiazanieKonta
                WHERE id_User = :user_id
                  AND id_Platformy = :platform_id
            """),
            {
                "user_id": user_id,
                "platform_id": platform_id
            }
        ).first()

        if existing is None:
            raise HTTPException(
                status_code=404,
                detail="Account link not found"
            )

        connection.execute(
            text("""
                DELETE FROM PowiazanieKonta
                WHERE id_User = :user_id
                  AND id_Platformy = :platform_id
            """),
            {
                "user_id": user_id,
                "platform_id": platform_id
            }
        )

    return {
        "message": "Account link deleted",
        "id_User": user_id,
        "id_Platformy": platform_id
    }