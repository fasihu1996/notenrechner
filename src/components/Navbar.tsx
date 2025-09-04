import Link from "next/link";
import React from "react";
import ModeToggle from "./ModeToggle";
import { createClient } from "@/utils/supabase/server";
import LogoutButton from "./LogoutButton";
import { Button } from "./ui/button";
import { LogIn } from "lucide-react";
import { Kablammo } from "next/font/google";

const deliusSwashCaps = Kablammo({
  subsets: ["latin"],
  weight: ["400"],
});

async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav
      className={`bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur`}
    >
      <div className="flex h-12 items-center justify-between px-2 sm:h-16 sm:px-4">
        <div className="flex items-center">
          <Link
            href="/"
            className={`text-primary p-2 text-4xl font-bold sm:p-4 sm:text-2xl lg:text-4xl ${deliusSwashCaps.className}`}
          >
            Notenrechner
          </Link>
        </div>
        <div className="ml-auto flex items-center justify-end space-x-1 sm:space-x-4">
          {user ? (
            <>
              <span className="text-primary max-w-32 truncate p-1 text-xs font-medium sm:max-w-none sm:p-4 sm:text-sm lg:text-lg">
                {user.email}
              </span>
              <LogoutButton />
            </>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              asChild
              className="h-10 cursor-pointer text-xs sm:h-10 sm:text-sm"
            >
              <Link href="/login">
                <LogIn />
              </Link>
            </Button>
          )}
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
