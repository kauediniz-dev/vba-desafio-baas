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

  const [activeSection, setActiveSection] = useState<
    "pix" | "card" | "withdrawal" | null
  >(null);

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
              feePercent={feePercent}
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
              onInstallmentsChange={setInstallments}
              onFeePercentChange={setFeePercent}
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
            />
          )}
        </div>

        <TransactionsTable
          transactions={transactions}
          isLoading={isLoadingTransactions}
          error={transactionsError}
        />
      </main>
    </div>
  );
}

export default App;
