import type { Transaction } from "../../models/interfaces/transaction.interface";

interface TransactionsTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

function getTransactionTypeLabel(type: Transaction["type"]) {
  switch (type) {
    case "PIX":
      return "PIX";
    case "CREDIT_CARD":
      return "Cartão";
    case "WITHDRAWAL":
      return "Saque";
  }
}

function getTransactionStatusLabel(status: Transaction["status"]) {
  switch (status) {
    case "APPROVED":
      return "Aprovado";
    case "PENDING":
      return "Pendente";
    case "DENIED":
      return "Negado";
    case "EXPIRED":
      return "Expirado";
    case "CANCELLED":
      return "Cancelado";
  }
}

function getTransactionStatusClass(status: Transaction["status"]) {
  return status.toLowerCase();
}

export function TransactionsTable({
  transactions,
  isLoading,
  error,
}: TransactionsTableProps) {
  return (
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

        {isLoading ? (
          <div className="transactions-feedback">Carregando transações...</div>
        ) : error ? (
          <div className="transactions-feedback error">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="transactions-feedback">
            Nenhuma transação encontrada.
          </div>
        ) : (
          transactions.map((transaction) => (
            <div className="transaction-row" key={transaction.id}>
              <div>
                <strong>{transaction.description}</strong>
                <span>{transaction.externalReference ?? "Sem referência"}</span>
              </div>

              <span>{getTransactionTypeLabel(transaction.type)}</span>

              <span
                className={`status ${getTransactionStatusClass(
                  transaction.status,
                )}`}
              >
                {getTransactionStatusLabel(transaction.status)}
              </span>

              <strong>
                {transaction.type === "WITHDRAWAL"
                  ? `- ${transaction.amountFormatted}`
                  : transaction.amountFormatted}
              </strong>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
