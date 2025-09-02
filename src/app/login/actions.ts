"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  if (!formData || typeof formData.get !== "function") {
    return { error: "Invalid form data received", code: "invalid_data" };
  }

  const supabase = await createClient();

  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "Email and password are required", code: "missing_fields" };
  }

  const data = {
    email: email as string,
    password: password as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return {
      error: error.message,
      code: error.message.includes("Invalid login credentials")
        ? "invalid_credentials"
        : "unknown_error",
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  if (!formData || typeof formData.get !== "function") {
    return { error: "Invalid form data received", code: "invalid_data" };
  }

  const supabase = await createClient();

  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "Email and password are required", code: "missing_fields" };
  }

  const data = {
    email: email as string,
    password: password as string,
  };

  if (data.password.length < 8) {
    return {
      error: "Password must be at least 8 characters long",
      code: "weak_password",
    };
  }

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/confirm`,
    },
  });

  if (error) {
    let errorCode = "unknown_error";
    if (error.message.includes("User already registered")) {
      errorCode = "user_exists";
    } else if (error.message.includes("Password")) {
      errorCode = "weak_password";
    } else if (error.message.includes("Email")) {
      errorCode = "invalid_email";
    }

    return { error: error.message, code: errorCode };
  }

  revalidatePath("/", "layout");
  redirect("/");
}
