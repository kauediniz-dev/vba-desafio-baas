interface SidebarProps {
  activeSection: "overview" | "pix" | "card" | "withdrawal";
  onOverview: () => void;
  onPix: () => void;
  onCard: () => void;
  onWithdrawal: () => void;
}

export function Sidebar({
  activeSection,
  onOverview,
  onPix,
  onCard,
  onWithdrawal,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">L</div>

        <div>
          <strong>Lera Pay</strong>
          <span>BaaS Dashboard</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${activeSection === "overview" ? "active" : ""}`}
          type="button"
          onClick={onOverview}
        >
          Visão geral
        </button>

        <button
          className={`nav-item ${activeSection === "pix" ? "active" : ""}`}
          type="button"
          onClick={onPix}
        >
          PIX
        </button>

        <button
          className={`nav-item ${activeSection === "card" ? "active" : ""}`}
          type="button"
          onClick={onCard}
        >
          Cartão
        </button>

        <button
          className={`nav-item ${
            activeSection === "withdrawal" ? "active" : ""
          }`}
          type="button"
          onClick={onWithdrawal}
        >
          Saque
        </button>
      </nav>

      <div className="sidebar-footer">
        <span>Ambiente</span>
        <strong>Sandbox</strong>
      </div>
    </aside>
  );
}
