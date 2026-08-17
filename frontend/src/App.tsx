import { useEffect, useState } from "react";
import "./App.css";
import { api } from "./services/api";
import type { Wallet } from "./models/interfaces/wallet.interface";
import { LoginPage } from "./pages/login/LoginPage";
import type { User } from "./models/interfaces/user.interface";
import type { PixResult } from "./models/interfaces/pix.interface";
import type { CardResult } from "./models/interfaces/card.interface";
import type { WithdrawalResult } from "./models/interfaces/withdrawal.interface";
import { PixForm } from "./components/forms/PixForm";
import { CardForm } from "./components/forms/CardForm";
import { WithdrawalForm } from "./components/forms/WithdrawalForm";
import { QuickActions } from "./components/dashboard/QuickActions";
import { TransactionsTable } from "./components/dashboard/TransactionsTable";
import { TopNavigation } from "./components/layout/TopNavigation";
import { Header } from "./components/layout/Header";
import { BalanceCard } from "./components/dashboard/BalanceCard";
import type {
  Transaction,
  TransactionsResponse,
} from "./models/interfaces/transaction.interface";
import type {
  CardBrand,
  CardFee,
  FeesResponse,
} from "./models/interfaces/fee.interface";

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(
    null,
  );

  const [isCheckingWithdrawal, setIsCheckingWithdrawal] = useState(false);

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);

  const [transactionStatusFilter, setTransactionStatusFilter] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("");

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

  const [cardResult, setCardResult] = useState<CardResult | null>(null);
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);

  const [cardBrand, setCardBrand] = useState<CardBrand>("VISA");
  const [cardFees, setCardFees] = useState<CardFee[]>([]);

  const [withdrawalCheckedAt, setWithdrawalCheckedAt] = useState<string | null>(
    null,
  );

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

  const [activeSection, setActiveSection] = useState<
    "pix" | "card" | "withdrawal" | null
  >(null);

  const selectedCardFee =
    cardFees.find((fee) => fee.installments === Number(installments)) ?? null;

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
    let ignore = false;

    async function fetchCardFees() {
      try {
        const response = await api.get<FeesResponse>("/checkout/fees", {
          params: {
            brand: cardBrand,
          },
        });

        if (!ignore) {
          setCardFees(response.data.fees);
        }
      } catch {
        if (!ignore) {
          setCardFees([]);
        }
      }
    }

    void fetchCardFees();

    return () => {
      ignore = true;
    };
  }, [cardBrand]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let ignore = false;

    async function fetchWallet() {
      try {
        const response = await api.get<Wallet>("/gateway/wallet");

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

    let ignore = false;

    async function fetchTransactions() {
      try {
        const response = await api.get<TransactionsResponse>(
          "/gateway/wallet/transactions",
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
      const response = await api.get<Wallet>("/gateway/wallet");

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
      const response = await api.post<PixResult>("/checkout/pix", {
        amount: parseCurrencyToCents(pixAmount),
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
        "/gateway/wallet/transactions",
        {
          params: {
            limit: 20,
            ...(transactionStatusFilter && {
              status: transactionStatusFilter,
            }),
            ...(transactionTypeFilter && {
              type: transactionTypeFilter,
            }),
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

  async function handleClearTransactionFilters() {
    setTransactionStatusFilter("");
    setTransactionTypeFilter("");

    if (!user) {
      return;
    }

    setIsLoadingTransactions(true);
    setTransactionsError(null);

    try {
      const response = await api.get<TransactionsResponse>(
        "/gateway/wallet/transactions",
        {
          params: {
            limit: 20,
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

    if (!selectedCardFee) {
      setCardError("Selecione uma combinação válida de parcelas.");
      return;
    }

    setIsCreatingCard(true);
    setCardError(null);
    setCardResult(null);

    try {
      const response = await api.post<CardResult>("/checkout/card", {
        amount: parseCurrencyToCents(cardAmount),
        description: cardDescription,
        externalReference: cardExternalReference,
        cardNumber: cardNumber.replace(/\D/g, ""),
        cardHolder,
        expiryMonth,
        expiryYear,
        cvv,
        installments: Number(installments),
        feePercent: selectedCardFee.feePercent,
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

  async function handleCheckWithdrawalStatus() {
    if (!withdrawalResult) {
      return;
    }

    setIsCheckingWithdrawal(true);
    setWithdrawalError(null);

    try {
      const response = await api.get<WithdrawalResult>(
        `/withdrawals/${withdrawalResult.id}`,
      );

      setWithdrawalResult((currentResult) => {
        if (!currentResult) {
          return response.data;
        }

        return {
          ...currentResult,
          ...response.data,
          externalReference:
            response.data.externalReference || currentResult.externalReference,
          walletBalance:
            response.data.walletBalance ?? currentResult.walletBalance,
          walletBalanceFormatted:
            response.data.walletBalanceFormatted ||
            currentResult.walletBalanceFormatted,
        };
      });

      setWithdrawalCheckedAt(
        new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );

      await Promise.all([handleRefreshWallet(), handleRefreshTransactions()]);
    } catch {
      setWithdrawalError("Não foi possível consultar o status do saque.");
    } finally {
      setIsCheckingWithdrawal(false);
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
      const response = await api.post<WithdrawalResult>("/withdrawals", {
        amount: parseCurrencyToCents(withdrawalAmount),
        pixKey: withdrawalPixKey,
        description: withdrawalDescription,
        externalReference: withdrawalExternalReference,
        document: withdrawalDocument,
      });
      setWithdrawalResult(response.data);

      await Promise.all([handleRefreshWallet(), handleRefreshTransactions()]);
    } catch {
      setWithdrawalError("Não foi possível realizar o saque.");
    } finally {
      setIsCreatingWithdrawal(false);
    }
  }

  function scrollToOperation() {
    window.setTimeout(() => {
      document.getElementById("operation-area")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  function handleOpenPix() {
    setIsPixOpen(true);
    setIsCardOpen(false);
    setIsWithdrawalOpen(false);

    setPixResult(null);
    setPixError(null);

    setActiveSection("pix");
    scrollToOperation();
  }

  function handleOpenCard() {
    setIsCardOpen(true);
    setIsPixOpen(false);
    setIsWithdrawalOpen(false);

    setCardResult(null);
    setCardError(null);

    setActiveSection("card");
    scrollToOperation();
  }

  function handleOpenWithdrawal() {
    setIsWithdrawalOpen(true);
    setIsPixOpen(false);
    setIsCardOpen(false);

    setWithdrawalResult(null);
    setWithdrawalError(null);

    setActiveSection("withdrawal");
    scrollToOperation();
  }

  function parseCurrencyToCents(value: string) {
    const normalized = value
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "");

    return Math.round(Number(normalized) * 100);
  }

  return (
    <div className="app-shell">
      <TopNavigation
        user={user}
        activeSection={activeSection}
        onPix={handleOpenPix}
        onCard={handleOpenCard}
        onWithdrawal={handleOpenWithdrawal}
      />
      <main className="main-content">
        <Header />

        <BalanceCard
          wallet={wallet}
          isLoading={isLoadingWallet}
          error={walletError}
          onRefresh={() => void handleRefreshWallet()}
        />

        <QuickActions
          onOpenPix={handleOpenPix}
          onOpenCard={handleOpenCard}
          onOpenWithdrawal={handleOpenWithdrawal}
        />
        <div id="operation-area">
          {isPixOpen && (
            <PixForm
              amount={pixAmount}
              description={pixDescription}
              payerDocument={pixPayerDocument}
              externalReference={pixExternalReference}
              result={pixResult}
              error={pixError}
              isLoading={isCreatingPix}
              onAmountChange={setPixAmount}
              onDescriptionChange={setPixDescription}
              onPayerDocumentChange={setPixPayerDocument}
              onExternalReferenceChange={setPixExternalReference}
              onSubmit={handleCreatePix}
              onClose={() => setIsPixOpen(false)}
            />
          )}

          {isCardOpen && (
            <CardForm
              amount={cardAmount}
              description={cardDescription}
              externalReference={cardExternalReference}
              cardNumber={cardNumber}
              cardHolder={cardHolder}
              expiryMonth={expiryMonth}
              expiryYear={expiryYear}
              cvv={cvv}
              installments={installments}
              brand={cardBrand}
              fees={cardFees}
              selectedFee={selectedCardFee}
              result={cardResult}
              error={cardError}
              isLoading={isCreatingCard}
              onAmountChange={setCardAmount}
              onDescriptionChange={setCardDescription}
              onExternalReferenceChange={setCardExternalReference}
              onCardNumberChange={setCardNumber}
              onCardHolderChange={setCardHolder}
              onExpiryMonthChange={setExpiryMonth}
              onExpiryYearChange={setExpiryYear}
              onCvvChange={setCvv}
              onBrandChange={(brand: CardBrand) => {
                setCardBrand(brand);
                setInstallments("1");
              }}
              onInstallmentsChange={setInstallments}
              onSubmit={handleCreateCard}
              onClose={() => setIsCardOpen(false)}
            />
          )}

          {isWithdrawalOpen && (
            <WithdrawalForm
              amount={withdrawalAmount}
              pixKey={withdrawalPixKey}
              description={withdrawalDescription}
              externalReference={withdrawalExternalReference}
              document={withdrawalDocument}
              lastCheckedAt={withdrawalCheckedAt}
              result={withdrawalResult}
              error={withdrawalError}
              isLoading={isCreatingWithdrawal}
              onAmountChange={setWithdrawalAmount}
              onPixKeyChange={setWithdrawalPixKey}
              onDescriptionChange={setWithdrawalDescription}
              onExternalReferenceChange={setWithdrawalExternalReference}
              onDocumentChange={setWithdrawalDocument}
              onSubmit={handleCreateWithdrawal}
              onClose={() => setIsWithdrawalOpen(false)}
              isCheckingStatus={isCheckingWithdrawal}
              onCheckStatus={handleCheckWithdrawalStatus}
            />
          )}
        </div>

        <TransactionsTable
          transactions={transactions}
          isLoading={isLoadingTransactions}
          error={transactionsError}
          statusFilter={transactionStatusFilter}
          typeFilter={transactionTypeFilter}
          onStatusFilterChange={setTransactionStatusFilter}
          onTypeFilterChange={setTransactionTypeFilter}
          onFilter={() => void handleRefreshTransactions()}
          onClearFilters={() => void handleClearTransactionFilters()}
        />
      </main>
    </div>
  );
}

export default App;
