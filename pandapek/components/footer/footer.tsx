import Image from "next/image";

function Footer() {

  return (
    <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-6 py-12 text-sm text-[#8983AB] sm:flex-row">
        <Image
            alt='Pandapek Logo'
            src="/logo.svg"
            className="w-16 h-16 color-[#B6A6EA]"
            width={16}
            height={16}
        />
        <p>Copyright © 2026 | All Rights Reserved</p>
    </footer>
  );
};

export default Footer;