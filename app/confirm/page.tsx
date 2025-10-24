import Link from "next/link";

export default function ConfirmEmailPage() {
  return (
    <div>
      <h1>Email Confirmed</h1>
      <p className="subtitle">
        Your email address is confirmed. You can now sign in using your new account.
      </p>
      <Link href="/" className="button-link">
        Return to sign in
      </Link>
    </div>
  );
}
