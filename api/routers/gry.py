from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import modele
from database import get_db
from modele import Gra
from schemas import GraCreate, GraResponse

router = APIRouter(prefix="/api/games", tags=["Gry"])


@router.get("", response_model=List[GraResponse])
def get_gry(db: Session = Depends(get_db)):
    return db.query(Gra).all()



@router.get("/{game_id}", response_model=GraResponse)
def get_gra(game_id: int, db: Session = Depends(get_db)):
    gra = db.query(Gra).filter(Gra.id_Gra == game_id).first()
    if not gra:
        raise HTTPException(status_code=404, detail="Gra nie istnieje")
    return gra


@router.post("", response_model=GraResponse, status_code=status.HTTP_201_CREATED)
def create_gra(gra: GraCreate, db: Session = Depends(get_db)):
    existing_game = db.query(Gra).filter(Gra.Nazwa == gra.Nazwa).first()
    if existing_game:
        return existing_game

    db_gra = Gra(**gra.model_dump())
    db.add(db_gra)
    db.commit()
    db.refresh(db_gra)
    return db_gra


@router.delete("/{game_id}")
def delete_game(game_id: int, db: Session = Depends(get_db)):
    game = db.query(modele.Gra).filter(modele.Gra.id_Gra == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Gra nie została odnaleziona")

    try:
        # Usuwanie powiązanych rekordów z innych tabel
        db.query(modele.Biblioteka).filter(modele.Biblioteka.id_Gra == game_id).delete()
        db.query(modele.PlatformaGra).filter(modele.PlatformaGra.id_Gra == game_id).delete()
        db.query(modele.Opinia).filter(modele.Opinia.id_Gra == game_id).delete()

        # Usuwanie samej gry
        db.delete(game)
        db.commit()
        return {"status": "ok", "message": f"Gra o ID {game_id} została usunięta."}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Nie można usunąć gry z powodu powiązanych danych: {str(e)}"
        )