import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { BrandHeader } from "@/components/brand-header";
import { Button } from "@/components/ui/button";

// Version élèves : inscription libre par email et mot de passe.
// Après la première connexion, l'écran /choisir-role permet de choisir son rôle.

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — Happy Place" },
      { name: "description", content: "Connexion à Happy Place, le dashboard interne de Bigger Boat." },
      { property: "og:title", content: "Connexion — Happy Place" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate({ to: "/" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  function switchMode(m: Mode) {
    setMode(m);
    setError(null);
    setInfo(null);
    setPassword("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!z.string().email().safeParse(cleanEmail).success) {
      setError("Saisis une adresse email valide.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error: err } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (err) {
          setError(
            /not confirmed/i.test(err.message)
              ? "Ce compte attend une confirmation par email. Désactive « Confirm email » dans Supabase (voir le README) ou clique sur le lien reçu."
              : "Email ou mot de passe incorrect.",
          );
          return;
        }
        navigate({ to: "/" });
      } else {
        const { data, error: err } = await supabase.auth.signUp({ email: cleanEmail, password });
        if (err) {
          setError(
            /already registered|already exists/i.test(err.message)
              ? "Un compte existe déjà avec cette adresse : connecte-toi."
              : `Création du compte impossible : ${err.message}`,
          );
          return;
        }
        if (data.session) {
          navigate({ to: "/choisir-role" });
        } else {
          setInfo(
            "Compte créé. Si la confirmation par email est activée dans Supabase, clique sur le lien reçu puis connecte-toi.",
          );
          setMode("signin");
        }
      }
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "mt-xs h-11 w-full border border-outline-variant bg-background px-sm font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary";
  const labelCls = "block font-label-sm text-label-sm uppercase text-on-surface-variant";
  const linkCls = "font-body-sm text-body-sm text-primary underline-offset-2 hover:underline";

  return (
    <div className="min-h-dvh w-full bg-background flex flex-col">
      <BrandHeader />
      <main className="flex flex-1 items-center justify-center px-md py-lg">
        <section className="w-[min(100%,28rem)] border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
          <div className="space-y-xs">
            <p className="font-label-sm text-label-sm uppercase text-on-surface-variant">
              {mode === "signin" ? "Connexion" : "Créer un compte"}
            </p>
            <h1 className="font-headline-lg text-headline-lg text-primary">Happy Place</h1>
            <p className="w-full font-body-md text-body-md text-on-surface-variant">
              {mode === "signin"
                ? "Connecte-toi avec ton email et ton mot de passe."
                : "Crée ton compte, puis choisis ton rôle : collaborateur, manager ou admin."}
            </p>
          </div>

          {error && (
            <p className="mt-md border border-error bg-error-container p-sm font-body-sm text-on-error-container" role="alert">
              {error}
            </p>
          )}
          {info && (
            <p className="mt-md border border-outline-variant bg-surface-container p-sm font-body-sm text-on-surface" role="status">
              {info}
            </p>
          )}

          <form onSubmit={submit} className="mt-md space-y-sm" noValidate>
            <label className={labelCls}>
              Email
              <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            </label>
            <label className={labelCls}>
              Mot de passe
              <input
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
              />
            </label>
            <Button type="submit" disabled={busy} className="h-12 w-full rounded-none font-label-md text-xs uppercase text-on-primary">
              {busy ? "PATIENTE…" : mode === "signin" ? "SE CONNECTER" : "CRÉER MON COMPTE"}
            </Button>
          </form>

          <div className="mt-sm flex flex-col items-start gap-xs">
            {mode === "signin" ? (
              <button type="button" className={linkCls} onClick={() => switchMode("signup")}>
                Pas encore de compte ? Créer un compte
              </button>
            ) : (
              <button type="button" className={linkCls} onClick={() => switchMode("signin")}>
                ← J'ai déjà un compte
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
