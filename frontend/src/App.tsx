import { useEffect, useState } from "react";
import "./App.css";
import { api } from "./services/api";
import type { Wallet } from "./models/interfaces/wallet.interface";
import { LoginPage } from "./pages/login/LoginPage";
import type { User } from "./models/interfaces/user.interface";
import type { PixResult } from "./models/interfaces/pix.interface";
import type { CardResult } from "./models/interfaces/card.interface";
import type { WithdrawalResult } from "./models/interfaces/withdrawal.interface";
import type {
  Transaction,
  TransactionsResponse,
} from "./models/interfaces/transaction.interface";

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

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(
    null,
  );

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);

  const [isPixOpen, setIsPixOpen] = useState(false);
  const [pixAmount, setPixAmount] = useState("");
  const [pixDescription, setPixDescription] = useState("");
  const [pixPayerDocument, setPixPayerDocument] = useState("");
  const [pixExternalReference, setPixExternalReference] = useState("");
  const [pixResult, setPixResult] = useState<PixResult | null>(null);
  const [isCreatingPix, setIsCreatingPix] = useState(false);
  const [pixError, setPixError] = useState<string | null>(null);

  const [isCardOpen, setIsCardOpen] = useState(false);

  const [cardAmount, setCardAmount] = useState("");
  const [cardDescription, setCardDescription] = useState("");
  const [cardExternalReference, setCardExternalReference] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [installments, setInstallments] = useState("1");
  const [feePercent, setFeePercent] = useState("0");

  const [cardResult, setCardResult] = useState<CardResult | null>(null);
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);

  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalPixKey, setWithdrawalPixKey] = useState("");
  const [withdrawalDescription, setWithdrawalDescription] = useState("");
  const [withdrawalExternalReference, setWithdrawalExternalReference] =
    useState("");
  const [withdrawalDocument, setWithdrawalDocument] = useState("");

  const [withdrawalResult, setWithdrawalResult] =
    useState<WithdrawalResult | null>(null);

  const [isCreatingWithdrawal, setIsCreatingWithdrawal] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);

  const [user, setUser] = useState<User | null>(() => {
    const storedUser = sessionStorage.getItem("lera-user");

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as User;
    } catch {
      sessionStorage.removeItem("lera-user");
      return null;
    }
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    const userId = user.id;
    let ignore = false;

    async function fetchWallet() {
      try {
        const response = await api.get<Wallet>(`/gateway/${userId}/wallet`);

        if (!ignore) {
          setWallet(response.data);
          setWalletError(null);
        }
      } catch {
        if (!ignore) {
          setWalletError("Não foi possível carregar o saldo.");
        }
      } finally {
        if (!ignore) {
          setIsLoadingWallet(false);
        }
      }
    }

    void fetchWallet();

    return () => {
      ignore = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const userId = user.id;
    let ignore = false;

    async function fetchTransactions() {
      try {
        const response = await api.get<TransactionsResponse>(
          `/gateway/${userId}/wallet/transactions`,
          {
            params: {
              limit: 5,
            },
          },
        );

        if (!ignore) {
          setTransactions(response.data.transactions);
          setTransactionsError(null);
        }
      } catch {
        if (!ignore) {
          setTransactionsError("Não foi possível carregar as transações.");
        }
      } finally {
        if (!ignore) {
          setIsLoadingTransactions(false);
        }
      }
    }

    void fetchTransactions();

    return () => {
      ignore = true;
    };
  }, [user]);

  async function handleRefreshWallet() {
    if (!user) {
      return;
    }

    setIsLoadingWallet(true);
    setWalletError(null);

    try {
      const response = await api.get<Wallet>(`/gateway/${user.id}/wallet`);

      setWallet(response.data);
    } catch {
      setWalletError("Não foi possível carregar o saldo.");
    } finally {
      setIsLoadingWallet(false);
    }
  }
  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  async function handleCreatePix(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      return;
    }

    setIsCreatingPix(true);
    setPixError(null);
    setPixResult(null);

    try {
      const response = await api.post<PixResult>(`/checkout/${user.id}/pix`, {
        amount: Number(pixAmount),
        description: pixDescription,
        payerDocument: pixPayerDocument,
        externalReference: pixExternalReference,
      });

      setPixResult(response.data);

      await Promise.all([handleRefreshWallet(), handleRefreshTransactions()]);
    } catch {
      setPixError("Não foi possível criar a cobrança PIX.");
    } finally {
      setIsCreatingPix(false);
    }
  }

  async function handleRefreshTransactions() {
    if (!user) {
      return;
    }

    setIsLoadingTransactions(true);
    setTransactionsError(null);

    try {
      const response = await api.get<TransactionsResponse>(
        `/gateway/${user.id}/wallet/transactions`,
        {
          params: {
            limit: 5,
          },
        },
      );

      setTransactions(response.data.transactions);
    } catch {
      setTransactionsError("Não foi possível carregar as transações.");
    } finally {
      setIsLoadingTransactions(false);
    }
  }

  async function handleCreateCard(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      return;
    }

    setIsCreatingCard(true);
    setCardError(null);
    setCardResult(null);

    try {
      const response = await api.post<CardResult>(`/checkout/${user.id}/card`, {
        amount: Number(cardAmount),
        description: cardDescription,
        externalReference: cardExternalReference,
        cardNumber,
        cardHolder,
        expiryMonth,
        expiryYear,
        cvv,
        installments: Number(installments),
        feePercent: Number(feePercent),
      });

      setCardResult(response.data);

      // Não mantemos dados sensíveis do cartão após a operação.
      setCardNumber("");
      setCvv("");

      await Promise.all([handleRefreshWallet(), handleRefreshTransactions()]);
    } catch {
      setCardError("Não foi possível processar o pagamento com cartão.");
    } finally {
      setIsCreatingCard(false);
    }
  }

  async function handleCreateWithdrawal(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!user) {
      return;
    }

    setIsCreatingWithdrawal(true);
    setWithdrawalError(null);
    setWithdrawalResult(null);

    try {
      const response = await api.post<WithdrawalResult>(
        `/withdrawals/${user.id}`,
        {
          amount: Number(withdrawalAmount),
          pixKey: withdrawalPixKey,
          description: withdrawalDescription,
          externalReference: withdrawalExternalReference,
          document: withdrawalDocument,
        },
      );

      setWithdrawalResult(response.data);

      await Promise.all([handleRefreshWallet(), handleRefreshTransactions()]);
    } catch {
      setWithdrawalError("Não foi possível realizar o saque.");
    } finally {
      setIsCreatingWithdrawal(false);
    }
  }

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
            <div className="user-avatar">
              {user.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>

            <div>
              <strong>{user.name}</strong>
              <span>Conta conectada</span>
            </div>
          </div>
        </header>

        <section className="balance-card">
          <div>
            <span className="balance-label">Saldo disponível</span>
            <strong className="balance-value">
              {isLoadingWallet
                ? "Carregando..."
                : walletError
                  ? "--"
                  : (wallet?.balanceFormatted ?? "R$ 0,00")}
            </strong>
            <span className="balance-caption">
              {walletError
                ? walletError
                : "Atualizado pela carteira da BranchPay"}
            </span>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={() => void handleRefreshWallet()}
            disabled={isLoadingWallet}
          >
            {isLoadingWallet ? "Atualizando..." : "Atualizar saldo"}
          </button>
        </section>
        <section className="quick-actions">
          <article className="action-card">
            <span className="action-icon">PIX</span>
            <h2>Criar cobrança PIX</h2>
            <p>Gere uma nova cobrança PIX e acompanhe o status do pagamento.</p>
            <button
              type="button"
              onClick={() => {
                setIsPixOpen(true);
                setIsCardOpen(false);
                setIsWithdrawalOpen(false);
                setPixResult(null);
                setPixError(null);
              }}
            >
              Criar PIX
            </button>
          </article>
          {isPixOpen && (
            <section className="operation-panel">
              <div className="operation-header">
                <div>
                  <span className="eyebrow">Nova cobrança</span>
                  <h2>PIX</h2>
                </div>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setIsPixOpen(false)}
                >
                  Fechar
                </button>
              </div>

              <form className="operation-form" onSubmit={handleCreatePix}>
                <label>
                  Valor em centavos
                  <input
                    type="number"
                    min="1"
                    value={pixAmount}
                    onChange={(event) => setPixAmount(event.target.value)}
                    placeholder="15000"
                    required
                  />
                </label>

                <label>
                  Descrição
                  <input
                    type="text"
                    value={pixDescription}
                    onChange={(event) => setPixDescription(event.target.value)}
                    placeholder="Pagamento pedido #123"
                    required
                  />
                </label>

                <label>
                  Documento do pagador
                  <input
                    type="text"
                    value={pixPayerDocument}
                    onChange={(event) =>
                      setPixPayerDocument(event.target.value)
                    }
                    minLength={11}
                    maxLength={14}
                    required
                  />
                </label>

                <label>
                  Referência externa
                  <input
                    type="text"
                    value={pixExternalReference}
                    onChange={(event) =>
                      setPixExternalReference(event.target.value)
                    }
                    placeholder="PEDIDO-123"
                    required
                  />
                </label>

                {pixError && (
                  <span className="operation-error">{pixError}</span>
                )}

                <button
                  type="submit"
                  className="operation-submit"
                  disabled={isCreatingPix}
                >
                  {isCreatingPix ? "Gerando PIX..." : "Gerar PIX"}
                </button>
              </form>

              {pixResult && (
                <div className="operation-result">
                  <div>
                    <span>Status</span>
                    <strong>{pixResult.status}</strong>
                  </div>

                  <div>
                    <span>Valor</span>
                    <strong>{pixResult.amountFormatted}</strong>
                  </div>

                  <div>
                    <span>Referência</span>
                    <strong>{pixResult.externalReference}</strong>
                  </div>

                  <div>
                    <span>TXID</span>
                    <strong>{pixResult.txid}</strong>
                  </div>

                  {pixResult.qrCodeBase64 && (
                    <img
                      src={pixResult.qrCodeBase64}
                      alt="QR Code PIX"
                      className="pix-qr-code"
                    />
                  )}

                  <label className="copy-paste-field">
                    PIX copia e cola
                    <textarea value={pixResult.copyPaste} readOnly />
                  </label>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      void navigator.clipboard.writeText(pixResult.copyPaste)
                    }
                  >
                    Copiar código PIX
                  </button>
                </div>
              )}
            </section>
          )}
          <article className="action-card">
            <span className="action-icon">CARD</span>
            <h2>Pagamento com cartão</h2>
            <p>Processe pagamentos com cartão, parcelas e cálculo de tarifa.</p>
            <button
              type="button"
              onClick={() => {
                setIsCardOpen(true);
                setIsPixOpen(false);
                setIsWithdrawalOpen(false);
                setCardResult(null);
                setCardError(null);
              }}
            >
              Novo pagamento
            </button>
          </article>
          {isCardOpen && (
            <section className="operation-panel">
              <div className="operation-header">
                <div>
                  <span className="eyebrow">Novo pagamento</span>
                  <h2>Cartão de crédito</h2>
                </div>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setIsCardOpen(false)}
                >
                  Fechar
                </button>
              </div>

              <form className="operation-form" onSubmit={handleCreateCard}>
                <label>
                  Valor em centavos
                  <input
                    type="number"
                    min="1"
                    value={cardAmount}
                    onChange={(event) => setCardAmount(event.target.value)}
                    placeholder="25000"
                    required
                  />
                </label>

                <label>
                  Descrição
                  <input
                    type="text"
                    value={cardDescription}
                    onChange={(event) => setCardDescription(event.target.value)}
                    placeholder="Compra loja online"
                    required
                  />
                </label>

                <label>
                  Referência externa
                  <input
                    type="text"
                    value={cardExternalReference}
                    onChange={(event) =>
                      setCardExternalReference(event.target.value)
                    }
                    placeholder="CARD-FRONT-001"
                    required
                  />
                </label>

                <label>
                  Número do cartão
                  <input
                    type="text"
                    inputMode="numeric"
                    minLength={13}
                    maxLength={19}
                    value={cardNumber}
                    onChange={(event) => setCardNumber(event.target.value)}
                    placeholder="4111111111111111"
                    required
                  />
                </label>

                <label>
                  Nome no cartão
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(event) => setCardHolder(event.target.value)}
                    placeholder="MARIA SILVA"
                    required
                  />
                </label>

                <label>
                  Mês de validade
                  <input
                    type="text"
                    inputMode="numeric"
                    minLength={2}
                    maxLength={2}
                    value={expiryMonth}
                    onChange={(event) => setExpiryMonth(event.target.value)}
                    placeholder="12"
                    required
                  />
                </label>

                <label>
                  Ano de validade
                  <input
                    type="text"
                    inputMode="numeric"
                    minLength={4}
                    maxLength={4}
                    value={expiryYear}
                    onChange={(event) => setExpiryYear(event.target.value)}
                    placeholder="2030"
                    required
                  />
                </label>

                <label>
                  CVV
                  <input
                    type="password"
                    inputMode="numeric"
                    minLength={3}
                    maxLength={4}
                    value={cvv}
                    onChange={(event) => setCvv(event.target.value)}
                    placeholder="123"
                    required
                  />
                </label>

                <label>
                  Parcelas
                  <input
                    type="number"
                    min="1"
                    value={installments}
                    onChange={(event) => setInstallments(event.target.value)}
                    required
                  />
                </label>

                <label>
                  Taxa (%)
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={feePercent}
                    onChange={(event) => setFeePercent(event.target.value)}
                    placeholder="3.19"
                    required
                  />
                </label>

                {cardError && (
                  <span className="operation-error">{cardError}</span>
                )}

                <button
                  type="submit"
                  className="operation-submit"
                  disabled={isCreatingCard}
                >
                  {isCreatingCard ? "Processando..." : "Processar pagamento"}
                </button>
              </form>

              {cardResult && (
                <div className="operation-result">
                  <div>
                    <span>Status</span>
                    <strong>{cardResult.status}</strong>
                  </div>

                  <div>
                    <span>Valor</span>
                    <strong>{cardResult.amountFormatted}</strong>
                  </div>

                  <div>
                    <span>Referência</span>
                    <strong>{cardResult.externalReference}</strong>
                  </div>

                  <div>
                    <span>Cartão</span>
                    <strong>
                      {cardResult.cardBrand} •••• {cardResult.cardLast4}
                    </strong>
                  </div>

                  <div>
                    <span>Parcelas</span>
                    <strong>{cardResult.installments}x</strong>
                  </div>

                  <div>
                    <span>Taxa</span>
                    <strong>
                      {cardResult.feePercent}% — {cardResult.feeAmountFormatted}
                    </strong>
                  </div>

                  <div>
                    <span>Valor bruto</span>
                    <strong>{cardResult.grossAmountFormatted}</strong>
                  </div>

                  <div>
                    <span>Valor líquido</span>
                    <strong>{cardResult.netAmountFormatted}</strong>
                  </div>

                  <div>
                    <span>Valor por parcela</span>
                    <strong>{cardResult.installmentAmountFormatted}</strong>
                  </div>

                  {cardResult.denialReason && (
                    <div>
                      <span>Motivo da recusa</span>
                      <strong>{cardResult.denialReason}</strong>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}
          <article className="action-card">
            <span className="action-icon">OUT</span>
            <h2>Solicitar saque</h2>
            <p>Transfira saldo disponível para uma chave PIX de destino.</p>
            <button
              type="button"
              onClick={() => {
                setIsWithdrawalOpen(true);
                setIsPixOpen(false);
                setIsCardOpen(false);
                setWithdrawalResult(null);
                setWithdrawalError(null);
              }}
            >
              Novo saque
            </button>
          </article>
        </section>

        {isWithdrawalOpen && (
          <section className="operation-panel">
            <div className="operation-header">
              <div>
                <span className="eyebrow">Nova transferência</span>
                <h2>Saque via PIX</h2>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={() => setIsWithdrawalOpen(false)}
              >
                Fechar
              </button>
            </div>

            <form className="operation-form" onSubmit={handleCreateWithdrawal}>
              <label>
                Valor em centavos
                <input
                  type="number"
                  min="1"
                  value={withdrawalAmount}
                  onChange={(event) => setWithdrawalAmount(event.target.value)}
                  placeholder="10000"
                  required
                />
              </label>

              <label>
                Chave PIX
                <input
                  type="text"
                  value={withdrawalPixKey}
                  onChange={(event) => setWithdrawalPixKey(event.target.value)}
                  placeholder="CPF, e-mail, telefone ou EVP"
                  required
                />
              </label>

              <label>
                Descrição
                <input
                  type="text"
                  value={withdrawalDescription}
                  onChange={(event) =>
                    setWithdrawalDescription(event.target.value)
                  }
                  placeholder="Saque para conta pessoal"
                  required
                />
              </label>

              <label>
                Referência externa
                <input
                  type="text"
                  value={withdrawalExternalReference}
                  onChange={(event) =>
                    setWithdrawalExternalReference(event.target.value)
                  }
                  placeholder="SAQUE-FRONT-001"
                  required
                />
              </label>

              <label>
                Documento
                <input
                  type="text"
                  value={withdrawalDocument}
                  onChange={(event) =>
                    setWithdrawalDocument(event.target.value)
                  }
                  placeholder="12345678901"
                  required
                />
              </label>

              {withdrawalError && (
                <span className="operation-error">{withdrawalError}</span>
              )}

              <button
                type="submit"
                className="operation-submit"
                disabled={isCreatingWithdrawal}
              >
                {isCreatingWithdrawal
                  ? "Processando saque..."
                  : "Solicitar saque"}
              </button>
            </form>

            {withdrawalResult && (
              <div className="operation-result">
                <div>
                  <span>Status</span>
                  <strong>{withdrawalResult.status}</strong>
                </div>

                <div>
                  <span>Valor</span>
                  <strong>{withdrawalResult.amountFormatted}</strong>
                </div>

                <div>
                  <span>Referência</span>
                  <strong>{withdrawalResult.externalReference}</strong>
                </div>

                <div>
                  <span>Mensagem</span>
                  <strong>{withdrawalResult.message}</strong>
                </div>

                <div>
                  <span>Saldo após operação</span>
                  <strong>{withdrawalResult.walletBalanceFormatted}</strong>
                </div>

                {withdrawalResult.denialReason && (
                  <div>
                    <span>Motivo da recusa</span>
                    <strong>{withdrawalResult.denialReason}</strong>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
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

            {isLoadingTransactions ? (
              <div className="transactions-feedback">
                Carregando transações...
              </div>
            ) : transactionsError ? (
              <div className="transactions-feedback error">
                {transactionsError}
              </div>
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
      </main>
    </div>
  );
}

export default App;
