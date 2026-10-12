from fastapi import FastAPI
from sqlalchemy import text
from app.routers.platforms import router as platforms_router
from app.database import engine
from app.routers.games import router as games_router
from app.routers.reviews import router as reviews_router
from app.routers.users import router as users_router
from app.routers.platform_games import router as platform_games_router
from app.routers.library import router as library_router
from app.routers.account_links import router as account_links_router



app = FastAPI(
    title="Game Database API",
    version="1.0.0"
)


app.include_router(games_router)
app.include_router(platforms_router)
app.include_router(reviews_router)
app.include_router(users_router)
app.include_router(platform_games_router)
app.include_router(library_router)
app.include_router(account_links_router)


@app.get("/")
def root():
    return {
        "status": "online"
    }


@app.get("/api/test/database")
def test_database():
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT COUNT(*) FROM Gra")
        )
        count = result.scalar()

    return {
        "database": "connected",
        "games": count
    }