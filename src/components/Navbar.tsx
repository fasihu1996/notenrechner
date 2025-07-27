import Link from "next/link";
import React from "react";
import ModeToggle from "./ModeToggle";
import { createClient } from "@/utils/supabase/server";
import LogoutButton from "./LogoutButton";
import { LogIn } from "lucide-react";
import { Button } from "./ui/button";

async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className='bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur'>
      <div className='flex h-16 items-center justify-between px-4'>
        <div className='flex items-center'>
          <Link
            href='/'
            className='text-primary p-4 font-mono text-3xl font-bold tracking-wider'
          >
            Notenrechner
          </Link>
        </div>
        <div className='ml-auto flex items-center justify-end space-x-4'>
          {user ? (
            // User is logged in
            <>
              <span className='text-primary p-4 font-mono text-lg font-medium'>
                {user.email}
              </span>
              <LogoutButton />
            </>
          ) : (
            // User is not logged in
            <>
              <Button
                variant='outline'
                href='/login'
                className='text-primary hover:text-primary/80 bg-accent p-4 font-mono text-xl font-bold tracking-wider transition-colors'
              >
                <LogIn />
              </Button>
            </>
          )}
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
