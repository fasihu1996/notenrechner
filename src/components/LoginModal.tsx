"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { login } from "@/app/login/actions";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth";
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
import { useRouter } from "next/navigation";

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
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsPending(true);
    setServerError(null);

    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    try {
      const result = await login(formData);
      if (result?.error) {
        setServerError(result.error);
      } else if (result?.success) {
        handleClose();
        router.replace("/");
      }
    } catch (_error) {
      setServerError("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  const handleClose = () => {
    setShowPassword(false);
    setServerError(null);
    reset();
    onClose();
  };

  const handleSwitchToSignup = () => {
    setShowPassword(false);
    setServerError(null);
    reset();
    onSwitchToSignup();
  };

  // Custom handler to prevent closing on certain events
  const handleOpenChange = (open: boolean) => {
    if (!open && isOpen) {
      setTimeout(() => {
        const activeElement = document.activeElement;
        const isInputFocused =
          activeElement?.tagName === "INPUT" ||
          activeElement?.tagName === "TEXTAREA";

        // Don't close if an input is focused (likely means extension is active)
        if (!isInputFocused) {
          handleClose();
        }
      }, 100);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onEscapeKeyDown={(e) => {
          const activeElement = document.activeElement;
          const isInputFocused =
            activeElement?.tagName === "INPUT" ||
            activeElement?.tagName === "TEXTAREA";
          if (isInputFocused) {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          const target = e.target as Element;
          if (
            target.closest("[data-extension]") ||
            target.closest('[class*="extension"]') ||
            target.closest('[id*="extension"]') ||
            target.closest('[class*="password"]') ||
            target.closest("[data-lastpass]") ||
            target.closest("[data-onepassword]")
          ) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <LogIn className="h-5 w-5" />
            Sign In
          </DialogTitle>
          <DialogDescription>
            Enter your credentials to access your account
          </DialogDescription>
        </DialogHeader>

        {/* Server Error Display */}
        {!isPending && serverError && (
          <div className="bg-destructive/10 border-destructive/20 flex items-center gap-2 rounded-lg border p-3">
            <AlertCircle className="text-destructive h-4 w-4" />
            <span className="text-destructive text-sm">{serverError}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-sm font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
              <Input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                className={`pl-10 ${
                  errors.email
                    ? "border-destructive focus:border-destructive focus:ring-destructive"
                    : ""
                }`}
                {...register("email")}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <div className="text-destructive flex items-center gap-1 text-sm">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.email.message}</span>
              </div>
            )}
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
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={`pr-10 pl-10 ${
                  errors.password
                    ? "border-destructive focus:border-destructive focus:ring-destructive"
                    : ""
                }`}
                {...register("password")}
                autoComplete="current-password"
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
            {errors.password && (
              <div className="text-destructive flex items-center gap-1 text-sm">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.password.message}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full cursor-pointer"
            >
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
                className="text-primary hover:text-primary/80 cursor-pointer hover:underline"
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
