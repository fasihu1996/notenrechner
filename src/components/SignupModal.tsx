"use client";

import { useState, useActionState } from "react";
import { signup } from "@/app/login/actions";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupState, signupAction, isPending] = useActionState(signup, null);

  // Password strength checker
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
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordsMatch = password === confirmPassword;

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const handleSwitchToLogin = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    onSwitchToLogin();
  };

  const getErrorIcon = (errorCode?: string) => {
    switch (errorCode) {
      case "weak_password":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "invalid_credentials":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "user_exists":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserPlus className="h-5 w-5" />
            Create Account
          </DialogTitle>
          <DialogDescription>
            Sign up to start calculating your grades
          </DialogDescription>
        </DialogHeader>

        {/* Error Display */}
        {signupState?.error && (
          <div className="bg-destructive/10 border-destructive/20 flex items-center gap-2 rounded-lg border p-3">
            {getErrorIcon(signupState.code)}
            <span className="text-destructive text-sm">
              {signupState.error}
            </span>
          </div>
        )}

        <form action={signupAction} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="signup-email" className="text-sm font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
              <Input
                id="signup-email"
                name="email"
                type="email"
                placeholder="Enter your email"
                className={cn(
                  "pl-10",
                  email && !emailIsValid && "border-red-500",
                )}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {email && (
                <div className="absolute top-3 right-3">
                  {emailIsValid ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
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
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pr-10 pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className={cn(
                  "pr-10 pl-10",
                  confirmPassword && !passwordsMatch && "border-red-500",
                )}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-muted-foreground hover:text-foreground absolute top-3 right-3"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              {confirmPassword && (
                <div className="absolute top-3 right-3">
                  {passwordsMatch ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 pt-2">
            <Button
              type="submit"
              disabled={
                isPending ||
                !emailIsValid ||
                !passwordsMatch ||
                passwordStrength.score < 2
              }
              className="w-full"
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
                className="text-primary hover:text-primary/80 hover:underline"
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
