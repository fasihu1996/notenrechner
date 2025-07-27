"use client";
import * as React from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant='default'
      size='icon'
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className='cursor-pointer'
    >
      <SunIcon className='h-[1.2rem] w-[1.2rem] scale-0 rotate-0 transition-all dark:scale-100' />
      <MoonIcon className='absolute h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:rotate-0' />
      <span className='sr-only'>Toggle theme</span>
    </Button>
  );
}
