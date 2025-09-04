"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, UserPlus } from "lucide-react";
import LoginModal from "@/components/LoginModal";
import SignupModal from "@/components/SignupModal";

export default function LoginPage() {
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.replace("/");
        return;
      }

      setIsCheckingAuth(false);
    };

    checkUser();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.replace("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  const openLoginModal = () => {
    setIsSignupModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const openSignupModal = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(true);
  };

  const closeModals = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(false);
  };

  return (
    <>
      <div className="from-background to-muted/20 flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center">
            <h1 className="text-foreground text-3xl font-bold">
              Welcome to Notenrechner
            </h1>
            <p className="text-muted-foreground">
              Sign in to your account or create a new one to start calculating
              your grades
            </p>
          </div>

          {/* Action Card */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-semibold">
                Get Started
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sign In Button */}
              <Button
                onClick={openLoginModal}
                className="h-12 w-full cursor-pointer text-base font-medium"
                size="lg"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Sign In to Your Account
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="border-border w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card text-muted-foreground px-2">
                    New to Notenrechner?
                  </span>
                </div>
              </div>

              {/* Sign Up Button */}
              <Button
                onClick={openSignupModal}
                variant="secondary"
                className="hover:bg-primary/30 h-12 w-full cursor-pointer text-base font-medium"
                size="lg"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Create New Account
              </Button>

              {/* Additional Info */}
              <div className="text-muted-foreground pt-2 text-center text-sm">
                <p>
                  Create an account to save your grades and access them from any
                  device.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeModals}
        onSwitchToSignup={openSignupModal}
      />
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={closeModals}
        onSwitchToLogin={openLoginModal}
      />
    </>
  );
}
