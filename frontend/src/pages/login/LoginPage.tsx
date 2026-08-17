import { useState } from "react";

import { api } from "../../services/api";
import type { User } from "../../models/interfaces/user.interface";
import type { AuthResponse } from "../../models/interfaces/auth.interface";

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("teste@local.dev");
  const [document, setDocument] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<AuthResponse>("/auth/login", {
        email,
        document,
        password,
      });

      const { accessToken, user } = response.data;

      sessionStorage.setItem("lera-token", accessToken);
      sessionStorage.setItem("lera-user", JSON.stringify(user));

      onLogin(user);
    } catch {
      setError("Não foi possível realizar o login.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <div className="brand-mark">L</div>

          <div>
            <strong>Lera Pay</strong>
            <span>BaaS Dashboard</span>
          </div>
        </div>

        <div className="login-heading">
          <span className="eyebrow">Acesso ao ambiente</span>

          <h1>Entrar</h1>

          <p>Conecte sua conta local às credenciais da BranchPay.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Documento
            <input
              type="text"
              value={document}
              onChange={(event) => setDocument(event.target.value)}
              required
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error && <span className="login-error">{error}</span>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}
