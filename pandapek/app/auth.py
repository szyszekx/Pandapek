import os

from fastapi import Header, HTTPException
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GAME_API_KEY")


def verify_api_key(x_api_key: str = Header(...)):
    if not API_KEY:
        raise HTTPException(
            status_code=500,
            detail="API key is not configured"
        )

    if x_api_key != API_KEY:
        raise HTTPException(
            status_code=401,
            detail="Invalid API key"
        )

    return True