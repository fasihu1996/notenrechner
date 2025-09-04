"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh(); // This will trigger a server-side re-render
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      className="text-primary hover:bg-primary/30 bg-accent cursor-pointer p-4 font-mono text-xl font-bold tracking-wider transition-colors"
    >
      <LogOut />
    </Button>
  );
}
