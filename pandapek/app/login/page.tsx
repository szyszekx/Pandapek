
import Link from "next/link";
import {
  Gamepad2,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  LockKeyhole,
  LogIn,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#100B22] text-white">

      <section className="relative z-10 flex flex-1 items-center justify-center px-5 py-12">
        <div className="flex w-full max-w-[440px] flex-col items-center">

          <div className="mt-9 w-full rounded-2xl border border-[#B0A5E8]/20 bg-[#1B1433]/80 p-6 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-7">
            <div className="mb-6 flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#6C63FF]/15">
                <ShieldCheck
                  size={21}
                  className="text-[#B0A5E8]"
                />
              </div>

              <div>
                <h2 className="text-sm font-semibold">
                  Bezpieczne logowanie
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#B0A5E8]/80">
                  Uwierzytelnianie odbywa się przez
                  oficjalny system Steam OpenID.
                </p>
              </div>
            </div>

            {/* Steam login */}
            <Button
              asChild
              className="h-12 w-full rounded-xl bg-[#6C63FF] text-sm font-semibold text-white"
            >
              <a
                href="/api/auth/steam"
                className="flex items-center justify-center gap-3"
              >
                <LogIn size={19} />
                Zaloguj się przez Steam
                <ArrowRight size={17} />
              </a>
            </Button>

            <p className="mt-4 text-center text-xs leading-5 text-[#B0A5E8]/60">
              Zostaniesz przekierowany na oficjalną
              stronę Steam w celu zalogowania.
            </p>
          </div>

          <div className="mt-7 flex items-center gap-2 text-xs text-[#B0A5E8]/70">
            <LockKeyhole size={14} />
            <span>
              Nie przechowujemy Twojego hasła Steam.
            </span>
          </div>
        </div>
      </section>

    </main>
  );
}
