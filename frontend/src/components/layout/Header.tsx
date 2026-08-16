import type { User } from "../../models/interfaces/user.interface";

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="topbar">
      <div>
        <span className="eyebrow">Dashboard financeiro</span>
        <h1>Visão geral</h1>
      </div>

      <div className="user-badge">
        <div className="user-avatar">{initials}</div>

        <div>
          <strong>{user.name}</strong>
          <span>Conta conectada</span>
        </div>
      </div>
    </header>
  );
}
