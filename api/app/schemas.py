from pydantic import BaseModel, Field
from typing import Optional


class GameCreate(BaseModel):
    id_Gra: int
    Nazwa: str = Field(min_length=1)
    Opis: Optional[str] = None
    Producent: Optional[str] = None
    Wydawca: Optional[str] = None
    gatunek: Optional[str] = None
    data_premiery: Optional[str] = None
    kategoriaWiekowa: Optional[str] = None
    srednia_ocen: Optional[float] = Field(default=None, ge=0, le=5)

class PlatformCreate(BaseModel):
    id_Platformy: int
    Nazwa: str = Field(min_length=1)
    opis: Optional[str] = None



class ReviewCreate(BaseModel):
    Id_Opinia: int
    id_User: int
    id_Gra: int
    Tresc: Optional[str] = None
    Ocena: int = Field(ge=1, le=5)
    czy_poleca: bool = False
    czas_gry: Optional[float] = Field(default=None, ge=0)
    liczba_polubien: int = Field(default=0, ge=0)
    data_dodania: Optional[str] = None
    czy_edytowano: bool = False
    data_edycji: Optional[str] = None


class UserCreate(BaseModel):
    id_User: int
    login: str = Field(min_length=1)
    haslo: str = Field(min_length=1)
    data_zalozenia: Optional[str] = None

class PlatformGameCreate(BaseModel):
    id_platformy: int
    id_gra: int
    cena: Optional[float] = Field(default=None, ge=0)

class LibraryCreate(BaseModel):
    id_biblioteki: int
    id_User: int
    id_Gra: int
    id_Platformy: int

class AccountLinkCreate(BaseModel):
    id_User: int
    id_Platformy: int
    id_zewnetrzne: str

class PaginatedGames(BaseModel):
    items: list[GameCreate]
    total: int | None
    page: int | None
    limit: int | None
    total_pages: int | None