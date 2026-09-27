import React from "react";  
import SteamButton from "../components/ui/SteamButton";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-semibold">Pandapek</h1>

      <SteamButton loginUrl="http://localhost:5000/login/steam" />
    </main>
  );
}
