import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrandHeader } from "@/components/brand-header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nouveau mot de passe — Happy Place" },
      { name: "description", content: "Choisis un nouveau mot de passe pour ton accès Happy Place." },
      { property: "og:title", content: "Nouveau mot de passe — Happy Place" },
      { property: "og:description", content: "Réinitialisation du mot de passe Happy Place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") && session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Le mot de passe doit contenir au moins 8 caractères.");
    if (password !== confirm) return setError("Les deux mots de passe ne correspondent pas.");
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) {
      setError(
        /pwned|weak|compromis/i.test(err.message)
          ? "Ce mot de passe est trop faible ou a déjà fuité. Choisis-en un autre."
          : "Le lien a expiré ou n'est plus valide. Redemande un lien depuis la page de connexion.",
      );
      return;
    }
    navigate({ to: "/" });
  }

  const inputCls =
    "mt-xs h-11 w-full border border-outline-variant bg-background px-sm font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary";
  const labelCls = "block font-label-sm text-label-sm uppercase text-on-surface-variant";

  return (
    <div className="min-h-dvh w-full bg-background flex flex-col">
      <BrandHeader />
      <main className="flex flex-1 items-center justify-center px-md py-lg">
        <section className="w-[min(100%,28rem)] border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
          <p className="font-label-sm text-label-sm uppercase text-on-surface-variant">Accès sur invitation</p>
          <h1 className="font-headline-lg text-headline-lg text-primary">Nouveau mot de passe</h1>
          {!ready ? (
            <p className="mt-md font-body-md text-body-md text-on-surface-variant">
              Vérification du lien… Si rien ne se passe, redemande un lien depuis la page de connexion.
            </p>
          ) : (
            <form onSubmit={submit} className="mt-md space-y-sm" noValidate>
              {error && <p className="border border-error bg-error-container p-sm font-body-sm text-on-error-container" role="alert">{error}</p>}
              <label className={labelCls}>
                Nouveau mot de passe
                <input type="password" autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
              </label>
              <label className={labelCls}>
                Confirmation
                <input type="password" autoComplete="new-password" minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} />
              </label>
              <Button type="submit" disabled={busy} className="h-12 w-full rounded-none font-label-md text-xs uppercase text-on-primary">
                {busy ? "ENREGISTREMENT…" : "ENREGISTRER"}
              </Button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
