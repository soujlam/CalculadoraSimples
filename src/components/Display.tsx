import React, { useState } from 'react';
import { Copy, Check, AlertCircle, Cpu } from 'lucide-react';

interface DisplayProps {
  expression: string;
  currentInput: string;
  isLoading: boolean;
  errorMessage: string | null;
  pythonVersion?: string;
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  currentInput,
  isLoading,
  errorMessage,
  pythonVersion,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!currentInput || errorMessage) return;
    navigator.clipboard.writeText(currentInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Ajusta o tamanho da fonte com base na quantidade de caracteres para não estourar o visor
  const getFontSizeClass = (text: string) => {
    if (text.length > 14) return 'text-2xl sm:text-3xl';
    if (text.length > 10) return 'text-3xl sm:text-4xl';
    return 'text-4xl sm:text-5xl';
  };

  return (
    <div className="w-full bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800 flex flex-col justify-between min-h-[160px] relative overflow-hidden transition-all">
      {/* Barra superior de status do visor */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
        <div className="flex items-center gap-1.5 font-mono text-[11px] tracking-wide">
          <Cpu className={`w-3.5 h-3.5 transition-colors ${isLoading ? 'text-amber-400 animate-spin' : 'text-blue-400'}`} />
          <span className={isLoading ? 'text-amber-300 font-medium' : ''}>
            {isLoading ? 'Calculando no Python...' : `Backend Python ${pythonVersion ? `(${pythonVersion})` : ''}`}
          </span>
        </div>

        <button
          onClick={handleCopy}
          disabled={!currentInput || !!errorMessage}
          title="Copiar resultado"
          className="flex items-center gap-1 text-[11px] hover:text-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed px-1.5 py-0.5 rounded hover:bg-slate-800"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>

      {/* Linha da expressão anterior */}
      <div className="text-right min-h-[22px] text-slate-400 font-mono text-sm tracking-wide overflow-x-auto whitespace-nowrap scrollbar-none">
        {expression || <span className="opacity-0">0</span>}
      </div>

      {/* Linha principal com o valor digitado ou resultado */}
      <div className="text-right mt-1">
        {errorMessage ? (
          <div className="flex items-center justify-end gap-2 text-rose-400 py-1">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{errorMessage}</span>
          </div>
        ) : (
          <div
            className={`font-mono-numbers font-semibold tracking-tight text-white transition-opacity ${getFontSizeClass(
              currentInput
            )} ${isLoading ? 'opacity-40 animate-pulse' : 'opacity-100'}`}
          >
            {currentInput || '0'}
          </div>
        )}
      </div>
    </div>
  );
};
