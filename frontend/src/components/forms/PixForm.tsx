import type { FormEvent } from "react";

import type { PixResult } from "../../models/interfaces/pix.interface";

interface PixFormProps {
  amount: string;
  description: string;
  payerDocument: string;
  externalReference: string;
  result: PixResult | null;
  error: string | null;
  isLoading: boolean;

  onAmountChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPayerDocumentChange: (value: string) => void;
  onExternalReferenceChange: (value: string) => void;

  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}

export function PixForm({
  amount,
  description,
  payerDocument,
  externalReference,
  result,
  error,
  isLoading,
  onAmountChange,
  onDescriptionChange,
  onPayerDocumentChange,
  onExternalReferenceChange,
  onSubmit,
  onClose,
}: PixFormProps) {
  return (
    <section className="operation-panel">
      <div className="operation-header">
        <div>
          <span className="eyebrow">Nova cobrança</span>
          <h2>PIX</h2>
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
            placeholder="15000"
            required
          />
        </label>

        <label>
          Descrição
          <input
            type="text"
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            placeholder="Pagamento pedido #123"
            required
          />
        </label>

        <label>
          Documento do pagador
          <input
            type="text"
            value={payerDocument}
            onChange={(event) => onPayerDocumentChange(event.target.value)}
            minLength={11}
            maxLength={14}
            required
          />
        </label>

        <label>
          Referência externa
          <input
            type="text"
            value={externalReference}
            onChange={(event) => onExternalReferenceChange(event.target.value)}
            placeholder="PEDIDO-123"
            required
          />
        </label>

        {error && <span className="operation-error">{error}</span>}

        <button type="submit" className="operation-submit" disabled={isLoading}>
          {isLoading ? "Gerando PIX..." : "Gerar PIX"}
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
            <span>TXID</span>
            <strong>{result.txid}</strong>
          </div>

          {result.qrCodeBase64 && (
            <img
              src={result.qrCodeBase64}
              alt="QR Code PIX"
              className="pix-qr-code"
            />
          )}

          <label className="copy-paste-field">
            PIX copia e cola
            <textarea value={result.copyPaste} readOnly />
          </label>

          <button
            type="button"
            className="secondary-button"
            onClick={() => void navigator.clipboard.writeText(result.copyPaste)}
          >
            Copiar código PIX
          </button>
        </div>
      )}
    </section>
  );
}
