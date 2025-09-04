"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { signup } from "@/app/login/actions";
import { signupSchema, type SignupFormData } from "@/lib/schemas/auth";
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
import {
  UserPlus,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  Info,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
}

export default function SignupModal({
  isOpen,
  onClose,
  onSwitchToLogin,
}: SignupModalProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  });

  const password = watch("password", "");
  const confirmPassword = watch("confirmPassword", "");

  const checkPasswordStrength = (pwd: string): PasswordStrength => {
    const feedback: string[] = [];
    let score = 0;

    if (pwd.length >= 8) {
      score += 1;
    } else {
      feedback.push("At least 8 characters");
    }

    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) {
      score += 1;
    } else {
      feedback.push("Mix of uppercase & lowercase");
    }

    if (/\d/.test(pwd)) {
      score += 1;
    } else {
      feedback.push("At least one number");
    }

    if (/[^a-zA-Z0-9]/.test(pwd)) {
      score += 1;
    } else {
      feedback.push("At least one special character");
    }

    const colors = [
      "text-red-500",
      "text-orange-500",
      "text-yellow-500",
      "text-green-500",
    ];
    return {
      score,
      feedback,
      color: colors[Math.min(score, 3)],
    };
  };

  const passwordStrength = checkPasswordStrength(password);

  const onSubmit = async (data: SignupFormData) => {
    setIsPending(true);
    setServerError(null);

    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    try {
      const result = await signup(formData);
      if (result?.error) {
        setServerError(result.error);
      } else if (result?.success) {
        handleClose();
        router.push("/");
        router.refresh();
      }
    } catch (_error) {
      setServerError("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  const handleClose = () => {
    setShowPassword(false);
    setShowConfirmPassword(false);
    setServerError(null);
    reset();
    onClose();
  };

  const handleSwitchToLogin = () => {
    setShowPassword(false);
    setShowConfirmPassword(false);
    setServerError(null);
    reset();
    onSwitchToLogin();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && isOpen) {
      setTimeout(() => {
        const activeElement = document.activeElement;
        const isInputFocused =
          activeElement?.tagName === "INPUT" ||
          activeElement?.tagName === "TEXTAREA";

        if (!isInputFocused) {
          handleClose();
        }
      }, 100);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[80vh] overflow-y-auto sm:max-w-md"
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
            <UserPlus className="h-5 w-5" />
            Create Account
          </DialogTitle>
          <DialogDescription>
            Sign up to start calculating your grades
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
            <Label htmlFor="signup-email" className="text-sm font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
              <Input
                id="signup-email"
                type="email"
                placeholder="Enter your email"
                className={cn(
                  "pr-10 pl-10",
                  errors.email
                    ? "border-destructive focus:border-destructive focus:ring-destructive"
                    : "",
                )}
                {...register("email")}
              />
              {/* Show validation icon */}
              {watch("email") && !errors.email && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              )}
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
            <Label htmlFor="signup-password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={cn(
                  "pr-10 pl-10",
                  errors.password
                    ? "border-destructive focus:border-destructive focus:ring-destructive"
                    : "",
                )}
                {...register("password")}
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

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Password strength:</span>
                  <span className={passwordStrength.color}>
                    {
                      ["Very Weak", "Weak", "Fair", "Strong"][
                        passwordStrength.score
                      ]
                    }
                  </span>
                </div>
                <div className="flex space-x-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1 flex-1 rounded",
                        i < passwordStrength.score
                          ? passwordStrength.score <= 1
                            ? "bg-red-500"
                            : passwordStrength.score <= 2
                              ? "bg-orange-500"
                              : passwordStrength.score <= 3
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          : "bg-gray-200",
                      )}
                    />
                  ))}
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <div className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Info className="h-3 w-3" />
                    <span>Missing: {passwordStrength.feedback.join(", ")}</span>
                  </div>
                )}
              </div>
            )}

            {/* Password validation errors */}
            {errors.password && (
              <div className="text-destructive flex items-center gap-1 text-sm">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.password.message}</span>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor="signup-confirm-password"
              className="text-sm font-medium"
            >
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
              <Input
                id="signup-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className={cn(
                  "pr-10 pl-10",
                  errors.confirmPassword
                    ? "border-destructive focus:border-destructive focus:ring-destructive"
                    : "",
                )}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-muted-foreground hover:text-foreground absolute top-3 right-10"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              {confirmPassword &&
                !errors.confirmPassword &&
                password === confirmPassword && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                )}
            </div>
            {errors.confirmPassword && (
              <div className="text-destructive flex items-center gap-1 text-sm">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.confirmPassword.message}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 pt-2">
            <Button
              type="submit"
              disabled={isPending || passwordStrength.score < 2}
              className="w-full cursor-pointer"
            >
              {isPending ? (
                <>
                  <div className="border-background mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>

            {/* Switch to Login */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Already have an account?
              </span>{" "}
              <button
                type="button"
                onClick={handleSwitchToLogin}
                className="text-primary hover:text-primary/80 cursor-pointer hover:underline"
              >
                Sign In
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
