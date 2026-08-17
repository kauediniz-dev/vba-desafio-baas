import type { Transaction } from "../../models/interfaces/transaction.interface";

interface TransactionsTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;

  statusFilter: string;
  typeFilter: string;

  onStatusFilterChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onFilter: () => void;
  onClearFilters: () => void;
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
  statusFilter,
  typeFilter,
  onStatusFilterChange,
  onTypeFilterChange,
  onFilter,
  onClearFilters,
}: TransactionsTableProps) {
  return (
    <>
      <section className="transaction-filters-card">
        <div className="transaction-filters-heading">
          <div className="transaction-filter-icon">⌕</div>

          <div>
            <h2>Filtros do extrato</h2>
            <p>Refine suas transações</p>
          </div>
        </div>

        <div className="transactions-filters">
          <label>
            Status
            <select
              value={statusFilter}
              onChange={(event) => onStatusFilterChange(event.target.value)}
            >
              <option value="">Todos</option>
              <option value="APPROVED">Aprovado</option>
              <option value="PENDING">Pendente</option>
              <option value="DENIED">Negado</option>
              <option value="EXPIRED">Expirado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </label>

          <label>
            Tipo
            <select
              value={typeFilter}
              onChange={(event) => onTypeFilterChange(event.target.value)}
            >
              <option value="">Todos</option>
              <option value="PIX">PIX</option>
              <option value="CREDIT_CARD">Cartão</option>
              <option value="WITHDRAWAL">Saque</option>
            </select>
          </label>

          <button
            type="button"
            className="secondary-button transaction-clear-button"
            onClick={onClearFilters}
            disabled={isLoading}
          >
            Limpar filtros
          </button>

          <button
            type="button"
            className="transaction-filter-button"
            onClick={onFilter}
            disabled={isLoading}
          >
            {isLoading ? "Filtrando..." : "Aplicar filtros"}
          </button>
        </div>
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

          {isLoading ? (
            <div className="transactions-feedback">
              Carregando transações...
            </div>
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
                  <span>
                    {transaction.externalReference ?? "Sem referência"}
                  </span>
                </div>

                <span
                  className={`transaction-type ${transaction.type.toLowerCase()}`}
                >
                  {getTransactionTypeLabel(transaction.type)}
                </span>

                <span
                  className={`status ${getTransactionStatusClass(
                    transaction.status,
                  )}`}
                >
                  {getTransactionStatusLabel(transaction.status)}
                </span>

                <strong
                  className={
                    transaction.type === "WITHDRAWAL"
                      ? "transaction-value withdrawal"
                      : "transaction-value"
                  }
                >
                  {transaction.type === "WITHDRAWAL"
                    ? `- ${transaction.amountFormatted}`
                    : transaction.amountFormatted}
                </strong>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
