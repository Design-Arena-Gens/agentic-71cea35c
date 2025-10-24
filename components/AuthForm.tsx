"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabaseClient";

type AuthView = "sign-in" | "sign-up" | "forgot-password";

type AuthFormState = {
  email: string;
  password: string;
  confirmPassword: string;
  message: string | null;
  error: string | null;
  loading: boolean;
};

const initialState: AuthFormState = {
  email: "",
  password: "",
  confirmPassword: "",
  message: null,
  error: null,
  loading: false
};

export const AuthForm = () => {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [view, setView] = useState<AuthView>("sign-in");
  const [formState, setFormState] = useState<AuthFormState>(initialState);
  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const client = getSupabaseClient();
      setSupabase(client);
      setConfigError(null);
    } catch (error) {
      setConfigError(
        error instanceof Error ? error.message : "Supabase is not configured."
      );
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;

    const setup = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      setSessionUser(session?.user ?? null);
    };

    setup();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleChange = (key: keyof AuthFormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({
        ...prev,
        [key]: event.target.value,
        error: null,
        message: null
      }));
    };

  const setLoading = (loading: boolean) =>
    setFormState((prev) => ({ ...prev, loading }));

  const setMessage = (message: string | null, error = false) =>
    setFormState((prev) => ({
      ...prev,
      loading: false,
      message: error ? null : message,
      error: error ? message : null
    }));

  const handleSignOut = async () => {
    if (!supabase) {
      setMessage("Supabase is not configured.", true);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setMessage(error.message, true);
    } else {
      setSessionUser(null);
      setFormState(initialState);
      setView("sign-in");
      setMessage("You have been signed out.");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!supabase) {
      setMessage("Supabase is not configured.", true);
      return;
    }

    const { email, password, confirmPassword } = formState;

    if (view === "forgot-password") {
      if (!email) {
        setMessage("Enter the email associated with your account.", true);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset`
      });

      if (error) {
        setMessage(error.message, true);
      } else {
        setFormState((prev) => ({ ...prev, password: "" }));
        setMessage("Password reset link sent. Check your email inbox.");
      }

      return;
    }

    if (!email || !password) {
      setMessage("Email and password are required.", true);
      return;
    }

    if (view === "sign-up" && password !== confirmPassword) {
      setMessage("Passwords do not match.", true);
      return;
    }

    if (view === "sign-in") {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setMessage(error.message, true);
      } else {
        setSessionUser(data.user ?? null);
        setMessage("Welcome back! You are now signed in.");
      }

      return;
    }

    if (view === "sign-up") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/confirm`
        }
      });

      if (error) {
        setMessage(error.message, true);
        return;
      }

      setSessionUser(data.user ?? null);
      setMessage(
        data.user?.email_confirmed_at
          ? "Signup successful! You're now signed in."
          : "Check your inbox to confirm your email before signing in."
      );
    }
  };

  if (sessionUser) {
    return (
      <div>
        <h1>Welcome, {sessionUser.email}</h1>
        <p className="subtitle">
          You are authenticated with Supabase. Use the controls below to manage your
          session.
        </p>
        <button onClick={handleSignOut} disabled={formState.loading || !supabase}>
          Sign out
        </button>
        {formState.message && <p className="success">{formState.message}</p>}
        {formState.error && <p className="error">{formState.error}</p>}
        <p className="footer-text">
          This demo stores the session in the browser using Supabase Auth auto-refresh.
        </p>
      </div>
    );
  }

  return (
    <div>
      {configError && <p className="error">{configError}</p>}
      <h1>
        {view === "sign-in" && "Sign in"}
        {view === "sign-up" && "Create account"}
        {view === "forgot-password" && "Reset password"}
      </h1>
      <p className="subtitle">
        {view === "sign-in" && "Access your workspace using Supabase Auth."}
        {view === "sign-up" && "Create a new account and verify it from your inbox."}
        {view === "forgot-password" && "We will send a secure link to reset your password."}
      </p>

      <form onSubmit={handleSubmit}>
        <label>
          Email address
          <input
            type="email"
            placeholder="you@example.com"
            value={formState.email}
            onChange={handleChange("email")}
            required
          />
        </label>

        {view !== "forgot-password" && (
          <label>
            Password
            <input
              type="password"
              placeholder="Your password"
              value={formState.password}
              onChange={handleChange("password")}
              minLength={6}
              required
            />
          </label>
        )}

        {view === "sign-up" && (
          <label>
            Confirm password
            <input
              type="password"
              placeholder="Repeat password"
              value={formState.confirmPassword}
              onChange={handleChange("confirmPassword")}
              minLength={6}
              required
            />
          </label>
        )}

        <button type="submit" disabled={formState.loading}>
          {formState.loading ? "Please wait..." :
            view === "sign-in"
              ? "Sign in"
              : view === "sign-up"
              ? "Create account"
              : "Send reset link"}
        </button>
      </form>

      {view !== "forgot-password" && (
        <p className="auth-toggle">
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setView(view === "sign-in" ? "sign-up" : "sign-in");
              setFormState((prev) => ({
                ...prev,
                password: "",
                confirmPassword: "",
                message: null,
                error: null
              }));
            }}
          >
            {view === "sign-in" ? "Need an account?" : "Already have an account?"}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setView("forgot-password");
              setFormState((prev) => ({ ...prev, message: null, error: null }));
            }}
          >
            Forgot password?
          </button>
        </p>
      )}

      {view === "forgot-password" && (
        <p className="auth-toggle">
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setView("sign-in");
              setFormState(initialState);
            }}
          >
            Back to sign in
          </button>
        </p>
      )}

      {formState.message && <p className="success">{formState.message}</p>}
      {formState.error && <p className="error">{formState.error}</p>}

      <p className="footer-text">
        Configure your Supabase credentials in `.env.local`, deploy to Vercel, and
        Supabase will handle email confirmations, password resets, and session
        refreshes automatically.
      </p>
    </div>
  );
};
