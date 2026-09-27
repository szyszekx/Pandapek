import { getGames } from "@/lib/game-store";
import './games.css';

interface GamesPageProps {
    searchParams: Promise<{
        steamid?: string;
    }>;
}

export default async function GamesPage({ searchParams }: GamesPageProps) {
    const params = await searchParams;
    const steamid = params.steamid; 

    if (!steamid) {
        return (
            <div>
                <h1>Games</h1>
                <p>No Steam ID provided.</p>
            </div>
        );
    }

    const gamesData = getGames(steamid);
    
    if (!gamesData) {
        return (
            <div>
                <h1>Games</h1>
                <p>No games found for Steam ID: {steamid}</p>
            </div>
        );
    }

    return (
        <main>
            <h1 className="game-title">Games for Steam ID: {steamid}</h1>

            <div className="game-list">
                {gamesData.games.map((game) => (
                <div key={game.appid} className="game-item">
                    <h2>{game.name ?? `App ${game.appid}`}</h2>

                    <p>
                    Playtime: {Math.round(game.playtime_forever / 60)} hours
                    </p>
                </div>
                ))}
            </div>
        </main>
    );
}