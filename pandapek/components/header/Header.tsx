import HeaderLinks from "@/components/header/HeaderLinks";
import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/dist/client/link";
import { GameSearch } from "./search";

function Header({searchBar=false}: {searchBar?: boolean}) {

  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-4">
      <div className="flex items-center space-x-6 md:space-x-12">
        <Image
          alt='Pandapek Logo'
          src="/logo.svg"
          className="w-16 h-16 color-[#B6A6EA]"
          width={16}
          height={16}
          loading="eager"
          />
      </div>
      {searchBar && (
        <div className="flex items-center space-x-6 md:space-x-12 relative w-130 max-w-xl left-17">
          <GameSearch searchBar={true}/>
        </div>
      )}

      <nav className="flex items-center gap-6 text-sm text-[#B6A6EA]">
        <HeaderLinks />
          <Button
            asChild
            variant="outline"
            className="rounded-full border-[#B6A6EA] bg-transparent text-[#B6A6EA] hover:bg-[#B6A6EA]/10 hover:text-white">
            <Link href="/login">Zaloguj się</Link>
          </Button>
      </nav>
    </header>
  );
};

export default Header;