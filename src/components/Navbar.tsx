import Link from "next/link";
import React from "react";
import ModeToggle from "./ModeToggle";

function Navbar() {
    return (
        <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center">
                    <Link
                        href="/"
                        className="text-primary p-4 font-mono text-3xl font-bold tracking-wider"
                    >
                        Notenrechner
                    </Link>
                </div>
                <div className="ml-auto flex items-center justify-end space-x-4">
                    <Link
                        href="/courses"
                        className="text-primary p-4 font-mono text-xl font-bold tracking-wider"
                    >
                        Kurse
                    </Link>
                    <Link
                        href="/login"
                        
                        className="text-primary p-4 font-mono text-xl font-bold tracking-wider"
                    >
                        Anmelden
                    </Link>
                    <ModeToggle />
                </div>
                
            </div>
        </nav>
    );
}

export default Navbar;
