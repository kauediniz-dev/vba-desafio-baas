import type { User } from "../../models/interfaces/user.interface";

interface TopNavigationProps {
  user: User;
  activeSection: "pix" | "card" | "withdrawal" | null;
  onPix: () => void;
  onCard: () => void;
  onWithdrawal: () => void;
}

export function TopNavigation({
  user,
  activeSection,
  onPix,
  onCard,
  onWithdrawal,
}: TopNavigationProps) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="top-navigation">
      <div className="top-navigation-brand">
        <div className="brand-mark">L</div>

        <div>
          <strong>Lera Pay</strong>
          <span>BaaS Dashboard</span>
        </div>
      </div>

      <nav className="top-navigation-menu">
        <button
          type="button"
          className={`top-navigation-item ${
            activeSection === "pix" ? "active" : ""
          }`}
          onClick={onPix}
        >
          PIX
        </button>

        <button
          type="button"
          className={`top-navigation-item ${
            activeSection === "card" ? "active" : ""
          }`}
          onClick={onCard}
        >
          Cartão
        </button>

        <button
          type="button"
          className={`top-navigation-item ${
            activeSection === "withdrawal" ? "active" : ""
          }`}
          onClick={onWithdrawal}
        >
          Saque
        </button>
      </nav>

      <div className="top-navigation-user">
        <div className="user-avatar">{initials}</div>

        <div>
          <strong>{user.name}</strong>
          <span>Conta conectada</span>
        </div>
      </div>
    </header>
  );
}
