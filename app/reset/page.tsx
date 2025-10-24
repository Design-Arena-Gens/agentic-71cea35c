"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const client = getSupabaseClient();
      setSupabase(client);
      setConfigError(null);
    } catch (err) {
      setConfigError(
        err instanceof Error ? err.message : "Supabase is not configured."
      );
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;

    const init = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (session) {
        setSessionReady(true);
      }
    };

    void init();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSessionReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    if (!supabase) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setMessage("Password updated. You can now sign in with your new credentials.");
    setLoading(false);
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div>
      <h1>Reset password</h1>
      <p className="subtitle">
        Provide a new password for your account. This link is only valid for a short
        time, so complete the reset promptly.
      </p>

      {configError && <p className="error">{configError}</p>}

      {!sessionReady && (
        <p className="error">
          Waiting for a valid recovery session. If this page was opened manually, try
          opening the link directly from your email.
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label>
          New password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            minLength={6}
            required
            disabled={!sessionReady || loading}
          />
        </label>

        <label>
          Confirm password
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="••••••••"
            minLength={6}
            required
            disabled={!sessionReady || loading}
          />
        </label>

        <button type="submit" disabled={!sessionReady || loading}>
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <p className="footer-text">
        Done here? <Link href="/">Return to sign in</Link>
      </p>
    </div>
  );
}
