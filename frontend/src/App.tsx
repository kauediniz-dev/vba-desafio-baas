import "./App.css";

function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">L</div>

          <div>
            <strong>Lera Pay</strong>
            <span>BaaS Dashboard</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active" type="button">
            Visão geral
          </button>

          <button className="nav-item" type="button">
            PIX
          </button>

          <button className="nav-item" type="button">
            Cartão
          </button>

          <button className="nav-item" type="button">
            Saque
          </button>
        </nav>

        <div className="sidebar-footer">
          <span>Ambiente</span>
          <strong>Sandbox</strong>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">Dashboard financeiro</span>
            <h1>Visão geral</h1>
          </div>

          <div className="user-badge">
            <div className="user-avatar">KD</div>

            <div>
              <strong>Kaue Diniz</strong>
              <span>Conta conectada</span>
            </div>
          </div>
        </header>

        <section className="balance-card">
          <div>
            <span className="balance-label">Saldo disponível</span>
            <strong className="balance-value">R$ 634,04</strong>
            <span className="balance-caption">
              Atualizado pela carteira da BranchPay
            </span>
          </div>

          <button type="button" className="primary-button">
            Atualizar saldo
          </button>
        </section>

        <section className="quick-actions">
          <article className="action-card">
            <span className="action-icon">PIX</span>
            <h2>Criar cobrança PIX</h2>
            <p>Gere uma nova cobrança PIX e acompanhe o status do pagamento.</p>
            <button type="button">Criar PIX</button>
          </article>

          <article className="action-card">
            <span className="action-icon">CARD</span>
            <h2>Pagamento com cartão</h2>
            <p>Processe pagamentos com cartão, parcelas e cálculo de tarifa.</p>
            <button type="button">Novo pagamento</button>
          </article>

          <article className="action-card">
            <span className="action-icon">OUT</span>
            <h2>Solicitar saque</h2>
            <p>Transfira saldo disponível para uma chave PIX de destino.</p>
            <button type="button">Novo saque</button>
          </article>
        </section>

        <section className="transactions-section">
          <div className="section-header">
            <div>
              <span className="eyebrow">Movimentações</span>
              <h2>Últimas transações</h2>
            </div>

            <button type="button" className="secondary-button">
              Ver extrato completo
            </button>
          </div>

          <div className="transactions-table">
            <div className="transaction-row transaction-head">
              <span>Descrição</span>
              <span>Tipo</span>
              <span>Status</span>
              <span>Valor</span>
            </div>

            <div className="transaction-row">
              <div>
                <strong>Teste cartão via BaaS</strong>
                <span>CARD-LOCAL-001</span>
              </div>

              <span>Cartão</span>
              <span className="status approved">Aprovado</span>
              <strong>R$ 250,00</strong>
            </div>

            <div className="transaction-row">
              <div>
                <strong>Teste persistência PIX</strong>
                <span>PIX-LOCAL-002</span>
              </div>

              <span>PIX</span>
              <span className="status approved">Aprovado</span>
              <strong>R$ 1,00</strong>
            </div>

            <div className="transaction-row">
              <div>
                <strong>Teste saque via BaaS</strong>
                <span>SAQUE-LOCAL-003</span>
              </div>

              <span>Saque</span>
              <span className="status approved">Aprovado</span>
              <strong>- R$ 1,00</strong>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
