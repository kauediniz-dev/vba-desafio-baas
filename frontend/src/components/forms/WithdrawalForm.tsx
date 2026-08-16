import type { FormEvent } from "react";

import type { WithdrawalResult } from "../../models/interfaces/withdrawal.interface";

interface WithdrawalFormProps {
  amount: string;
  pixKey: string;
  description: string;
  externalReference: string;
  document: string;

  result: WithdrawalResult | null;
  error: string | null;
  isLoading: boolean;

  onAmountChange: (value: string) => void;
  onPixKeyChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onExternalReferenceChange: (value: string) => void;
  onDocumentChange: (value: string) => void;

  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}

export function WithdrawalForm({
  amount,
  pixKey,
  description,
  externalReference,
  document,
  result,
  error,
  isLoading,
  onAmountChange,
  onPixKeyChange,
  onDescriptionChange,
  onExternalReferenceChange,
  onDocumentChange,
  onSubmit,
  onClose,
}: WithdrawalFormProps) {
  return (
    <section className="operation-panel">
      <div className="operation-header">
        <div>
          <span className="eyebrow">Nova transferência</span>
          <h2>Saque via PIX</h2>
        </div>

        <button type="button" className="secondary-button" onClick={onClose}>
          Fechar
        </button>
      </div>

      <form className="operation-form" onSubmit={onSubmit}>
        <label>
          Valor em centavos
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(event) => onAmountChange(event.target.value)}
            placeholder="10000"
            required
          />
        </label>

        <label>
          Chave PIX
          <input
            type="text"
            value={pixKey}
            onChange={(event) => onPixKeyChange(event.target.value)}
            placeholder="CPF, e-mail, telefone ou EVP"
            required
          />
        </label>

        <label>
          Descrição
          <input
            type="text"
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            placeholder="Saque para conta pessoal"
            required
          />
        </label>

        <label>
          Referência externa
          <input
            type="text"
            value={externalReference}
            onChange={(event) => onExternalReferenceChange(event.target.value)}
            placeholder="SAQUE-FRONT-001"
            required
          />
        </label>

        <label>
          Documento
          <input
            type="text"
            value={document}
            onChange={(event) => onDocumentChange(event.target.value)}
            placeholder="12345678901"
            required
          />
        </label>

        {error && <span className="operation-error">{error}</span>}

        <button type="submit" className="operation-submit" disabled={isLoading}>
          {isLoading ? "Processando saque..." : "Solicitar saque"}
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
            <span>Mensagem</span>
            <strong>{result.message}</strong>
          </div>

          <div>
            <span>Saldo após operação</span>
            <strong>{result.walletBalanceFormatted}</strong>
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
