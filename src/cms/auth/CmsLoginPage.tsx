import { FormEvent, useState } from "react";
import { loginCms } from "./cmsAuthApi";

type Props = {
  onSuccess: () => void;
};

const CmsLoginPage = ({ onSuccess }: Props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await loginCms(username, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0714] px-4 text-white">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#120a1e] p-6 shadow-[0_24px_80px_rgba(0,0,0,.45)]">
        <div className="mb-6 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-300/80">Exacty Med</p>
          <h1 className="mt-2 text-xl font-semibold text-violet-100">Acesso ao CMS</h1>
          <p className="mt-1 text-sm text-white/50">Entre com suas credenciais para continuar.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-white/70">Usuário</span>
            <input
              type="text"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-lg border border-white/10 bg-[#0b0714] px-3 py-2.5 text-sm text-white outline-none ring-violet-500/40 placeholder:text-white/30 focus:ring-2"
              placeholder="Usuário"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-white/70">Senha</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-white/10 bg-[#0b0714] px-3 py-2.5 text-sm text-white outline-none ring-violet-500/40 placeholder:text-white/30 focus:ring-2"
              placeholder="Senha"
              required
            />
          </label>

          {error ? (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CmsLoginPage;
