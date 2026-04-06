"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { authClient } from "@/lib/auth-client";

type Mode = "sign-in" | "sign-up";

export default function SocialAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email || !password || (mode === "sign-up" && !name)) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "sign-up") {
        const result = await authClient.signUp.email({
          name,
          email,
          password,
          callbackURL: "/social",
        });

        if (result.error) {
          setError(result.error.message ?? "Sign up failed.");
          return;
        }
      } else {
        const result = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/social",
        });

        if (result.error) {
          setError(result.error.message ?? "Sign in failed.");
          return;
        }
      }

      router.push("/social");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const signInGoogle = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/social",
      });

      if (result.error) {
        setError(result.error.message ?? "Google sign-in failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            {mode === "sign-in" ? "Sign in to Social" : "Create Social account"}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="inline-flex rounded-md bg-social-surface p-1">
            <button
              type="button"
              onClick={() => setMode("sign-in")}
              className={`rounded px-3 py-1 text-sm ${
                mode === "sign-in"
                  ? "bg-social-accent text-social-ink"
                  : "text-social-ink/75"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("sign-up")}
              className={`rounded px-3 py-1 text-sm ${
                mode === "sign-up"
                  ? "bg-social-accent text-social-ink"
                  : "text-social-ink/75"
              }`}
            >
              Sign up
            </button>
          </div>

          <form className="grid gap-3" onSubmit={submit}>
            {mode === "sign-up" ? (
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Display name"
                autoComplete="name"
                required
              />
            ) : null}

            <Input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="Email"
              autoComplete="email"
              required
            />

            <Input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Password"
              autoComplete={
                mode === "sign-up" ? "new-password" : "current-password"
              }
              required
              minLength={8}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Please wait..."
                : mode === "sign-in"
                  ? "Sign in"
                  : "Create account"}
            </Button>
          </form>

          <Button
            type="button"
            variant="outline"
            onClick={signInGoogle}
            disabled={isSubmitting}
          >
            Continue with Google
          </Button>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <p className="text-sm text-social-ink/75">
            Back to{" "}
            <Link href="/social" className="underline">
              Social board
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
