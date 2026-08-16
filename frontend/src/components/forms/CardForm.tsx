import type { FormEvent } from "react";

import type { CardResult } from "../../models/interfaces/card.interface";

interface CardFormProps {
  amount: string;
  description: string;
  externalReference: string;
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  installments: string;
  feePercent: string;

  result: CardResult | null;
  error: string | null;
  isLoading: boolean;

  onAmountChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onExternalReferenceChange: (value: string) => void;
  onCardNumberChange: (value: string) => void;
  onCardHolderChange: (value: string) => void;
  onExpiryMonthChange: (value: string) => void;
  onExpiryYearChange: (value: string) => void;
  onCvvChange: (value: string) => void;
  onInstallmentsChange: (value: string) => void;
  onFeePercentChange: (value: string) => void;

  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}

export function CardForm({
  amount,
  description,
  externalReference,
  cardNumber,
  cardHolder,
  expiryMonth,
  expiryYear,
  cvv,
  installments,
  feePercent,
  result,
  error,
  isLoading,
  onAmountChange,
  onDescriptionChange,
  onExternalReferenceChange,
  onCardNumberChange,
  onCardHolderChange,
  onExpiryMonthChange,
  onExpiryYearChange,
  onCvvChange,
  onInstallmentsChange,
  onFeePercentChange,
  onSubmit,
  onClose,
}: CardFormProps) {
  return (
    <section className="operation-panel">
      <div className="operation-header">
        <div>
          <span className="eyebrow">Novo pagamento</span>
          <h2>Cartão de crédito</h2>
        </div>

        <button type="button" className="secondary-button" onClick={onClose}>
          Fechar
        </button>
      </div>

      <form className="operation-form card-operation-form" onSubmit={onSubmit}>
        <div className="card-section">
          <div className="card-section-heading">
            <span className="eyebrow">Dados da compra</span>
            <h3>Informações do pagamento</h3>
          </div>

          <div className="card-grid-two">
            <label>
              Valor em centavos
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(event) => onAmountChange(event.target.value)}
                placeholder="25000"
                required
              />
            </label>

            <label>
              Descrição
              <input
                type="text"
                value={description}
                onChange={(event) => onDescriptionChange(event.target.value)}
                placeholder="Compra loja online"
                required
              />
            </label>
          </div>

          <label>
            Referência externa
            <input
              type="text"
              value={externalReference}
              onChange={(event) =>
                onExternalReferenceChange(event.target.value)
              }
              placeholder="CARD-FRONT-001"
              required
            />
          </label>
        </div>

        <div className="card-section card-data-section">
          <div className="card-section-heading">
            <span className="eyebrow">Dados do cartão</span>
            <h3>Cartão de crédito</h3>
            <p>Informe os dados do cartão utilizado no pagamento.</p>
          </div>

          <label>
            Número do cartão
            <input
              type="text"
              inputMode="numeric"
              minLength={13}
              maxLength={19}
              value={cardNumber}
              onChange={(event) => onCardNumberChange(event.target.value)}
              placeholder="0000 0000 0000 0000"
              autoComplete="cc-number"
              required
            />
          </label>

          <label>
            Nome do titular
            <input
              type="text"
              value={cardHolder}
              onChange={(event) => onCardHolderChange(event.target.value)}
              placeholder="Ex.: Maria Silva"
              autoComplete="cc-name"
              required
            />
            <small>Conforme aparece no cartão.</small>
          </label>

          <div className="card-security-grid">
            <fieldset className="expiry-group">
              <legend>Vencimento</legend>

              <div className="expiry-inputs">
                <input
                  type="text"
                  inputMode="numeric"
                  minLength={2}
                  maxLength={2}
                  value={expiryMonth}
                  onChange={(event) => onExpiryMonthChange(event.target.value)}
                  placeholder="MM"
                  autoComplete="cc-exp-month"
                  aria-label="Mês de validade"
                  required
                />

                <span>/</span>

                <input
                  type="text"
                  inputMode="numeric"
                  minLength={4}
                  maxLength={4}
                  value={expiryYear}
                  onChange={(event) => onExpiryYearChange(event.target.value)}
                  placeholder="AAAA"
                  autoComplete="cc-exp-year"
                  aria-label="Ano de validade"
                  required
                />
              </div>
            </fieldset>

            <label>
              Código de segurança
              <input
                type="password"
                inputMode="numeric"
                minLength={3}
                maxLength={4}
                value={cvv}
                onChange={(event) => onCvvChange(event.target.value)}
                placeholder="000"
                autoComplete="cc-csc"
                required
              />
              <small>3 ou 4 dígitos.</small>
            </label>
          </div>
        </div>

        <div className="card-section">
          <div className="card-section-heading">
            <span className="eyebrow">Condições</span>
            <h3>Parcelamento e taxa</h3>
          </div>

          <div className="card-grid-two">
            <label>
              Parcelas
              <input
                type="number"
                min="1"
                value={installments}
                onChange={(event) => onInstallmentsChange(event.target.value)}
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
                onChange={(event) => onFeePercentChange(event.target.value)}
                placeholder="3.19"
                required
              />
            </label>
          </div>
        </div>

        {error && <span className="operation-error">{error}</span>}

        <button
          type="submit"
          className="operation-submit card-submit"
          disabled={isLoading}
        >
          {isLoading ? "Processando..." : "Processar pagamento"}
        </button>
      </form>

      {result && (
        <div className="operation-result">
          <div>
            <span>Status</span>
            <strong>{result.status}</strong>
          </div>

          <div>
            <span>Valor</span>
            <strong>{result.amountFormatted}</strong>
          </div>

          <div>
            <span>Referência</span>
            <strong>{result.externalReference}</strong>
          </div>

          <div>
            <span>Cartão</span>
            <strong>
              {result.cardBrand} •••• {result.cardLast4}
            </strong>
          </div>

          <div>
            <span>Parcelas</span>
            <strong>{result.installments}x</strong>
          </div>

          <div>
            <span>Taxa</span>
            <strong>
              {result.feePercent}% — {result.feeAmountFormatted}
            </strong>
          </div>

          <div>
            <span>Valor bruto</span>
            <strong>{result.grossAmountFormatted}</strong>
          </div>

          <div>
            <span>Valor líquido</span>
            <strong>{result.netAmountFormatted}</strong>
          </div>

          <div>
            <span>Valor por parcela</span>
            <strong>{result.installmentAmountFormatted}</strong>
          </div>

          {result.denialReason && (
            <div>
              <span>Motivo da recusa</span>
              <strong>{result.denialReason}</strong>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
