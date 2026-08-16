interface QuickActionsProps {
  onOpenPix: () => void;
  onOpenCard: () => void;
  onOpenWithdrawal: () => void;
}

export function QuickActions({
  onOpenPix,
  onOpenCard,
  onOpenWithdrawal,
}: QuickActionsProps) {
  return (
    <section className="quick-actions">
      <article className="action-card">
        <span className="action-icon">PIX</span>
        <h2>Criar cobrança PIX</h2>
        <p>Gere uma nova cobrança PIX e acompanhe o status do pagamento.</p>
        <button type="button" onClick={onOpenPix}>
          Criar PIX
        </button>
      </article>

      <article className="action-card">
        <span className="action-icon">CARD</span>
        <h2>Pagamento com cartão</h2>
        <p>Processe pagamentos com cartão, parcelas e cálculo de tarifa.</p>
        <button type="button" onClick={onOpenCard}>
          Novo pagamento
        </button>
      </article>

      <article className="action-card">
        <span className="action-icon">OUT</span>
        <h2>Solicitar saque</h2>
        <p>Transfira saldo disponível para uma chave PIX de destino.</p>
        <button type="button" onClick={onOpenWithdrawal}>
          Novo saque
        </button>
      </article>
    </section>
  );
}
