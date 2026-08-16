import type { Wallet } from "../../models/interfaces/wallet.interface";

interface BalanceCardProps {
  wallet: Wallet | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function BalanceCard({
  wallet,
  isLoading,
  error,
  onRefresh,
}: BalanceCardProps) {
  return (
    <section className="balance-card">
      <div>
        <span className="balance-label">Saldo disponível</span>

        <strong className="balance-value">
          {isLoading
            ? "Carregando..."
            : error
              ? "--"
              : (wallet?.balanceFormatted ?? "R$ 0,00")}
        </strong>

        <span className="balance-caption">
          {error ? error : "Atualizado pela carteira da BranchPay"}
        </span>
      </div>

      <button
        type="button"
        className="primary-button"
        onClick={onRefresh}
        disabled={isLoading}
      >
        {isLoading ? "Atualizando..." : "Atualizar saldo"}
      </button>
    </section>
  );
}
