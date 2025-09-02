"use client";

import { useActionState } from "react";
import { login } from "@/app/login/actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onSwitchToSignup,
}: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, loginAction, isPending] = useActionState(
    async (prevState: undefined, formData: FormData) => {
      return await login(formData);
    },
    null,
  );

  const handleClose = () => {
    setShowPassword(false);
    onClose();
  };

  const handleSwitchToSignup = () => {
    setShowPassword(false);
    onSwitchToSignup();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <LogIn className="h-5 w-5" />
            Sign In
          </DialogTitle>
          <DialogDescription>
            Enter your credentials to access your account
          </DialogDescription>
        </DialogHeader>

        {/* Error Display */}
        {loginState?.error && (
          <div className="bg-destructive/10 border-destructive/20 flex items-center gap-2 rounded-lg border p-3">
            <AlertCircle className="text-destructive h-4 w-4" />
            <span className="text-destructive text-sm">{loginState.error}</span>
          </div>
        )}

        <form action={loginAction} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-sm font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
              <Input
                id="login-email"
                name="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="login-password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
              <Input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pr-10 pl-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground absolute top-3 right-3"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 pt-2">
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <div className="border-background mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>

            {/* Switch to Signup */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Don&apos;t have an account?
              </span>{" "}
              <button
                type="button"
                onClick={handleSwitchToSignup}
                className="text-primary hover:text-primary/80 hover:underline"
              >
                Sign Up
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
