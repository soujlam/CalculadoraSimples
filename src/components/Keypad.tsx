import React from 'react';
import { Delete, Equal, Plus, Minus, X, Divide, Percent } from 'lucide-react';
import { Operator } from '../types.ts';

interface KeypadProps {
  onDigit: (digit: string) => void;
  onOperator: (op: Operator) => void;
  onCalculate: () => void;
  onClear: () => void;
  onAllClear: () => void;
  onBackspace: () => void;
  onToggleSign: () => void;
  onPercentage: () => void;
  activeOperator: Operator;
  isLoading: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({
  onDigit,
  onOperator,
  onCalculate,
  onClear,
  onAllClear,
  onBackspace,
  onToggleSign,
  onPercentage,
  activeOperator,
  isLoading,
}) => {
  const isOperatorActive = (op: Operator) => activeOperator === op;

  // Estilos de botões para manter consistência e acessibilidade
  const baseBtnClass =
    'h-14 sm:h-16 rounded-xl font-medium text-lg sm:text-xl flex items-center justify-center transition-all duration-150 select-none active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed';

  const numBtnClass = `${baseBtnClass} bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 font-mono-numbers font-semibold border border-slate-200/60 dark:border-slate-700/60 shadow-sm`;

  const funcBtnClass = `${baseBtnClass} bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300/50 dark:border-slate-600/50`;

  const opBtnClass = (op: Operator) =>
    `${baseBtnClass} ${
      isOperatorActive(op)
        ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400'
        : 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60'
    }`;

  const equalBtnClass = `${baseBtnClass} bg-blue-600 hover:bg-blue-700 text-white font-bold text-2xl shadow-md border border-blue-500`;

  return (
    <div className="grid grid-cols-4 gap-2.5 sm:gap-3 p-1">
      {/* Linha 1: Limpeza e Funções */}
      <button
        onClick={onAllClear}
        disabled={isLoading}
        className={`${funcBtnClass} text-rose-600 dark:text-rose-400 font-semibold`}
        title="Limpar tudo (Esc)"
      >
        AC
      </button>

      <button
        onClick={onBackspace}
        disabled={isLoading}
        className={funcBtnClass}
        title="Apagar último dígito (Backspace)"
      >
        <Delete className="w-5 h-5" />
      </button>

      <button
        onClick={onPercentage}
        disabled={isLoading}
        className={funcBtnClass}
        title="Porcentagem (%)"
      >
        <Percent className="w-5 h-5" />
      </button>

      <button
        onClick={() => onOperator('/')}
        disabled={isLoading}
        className={opBtnClass('/')}
        title="Dividir (/)"
      >
        <Divide className="w-6 h-6" />
      </button>

      {/* Linha 2: 7, 8, 9, Multiplicar */}
      <button onClick={() => onDigit('7')} disabled={isLoading} className={numBtnClass}>
        7
      </button>
      <button onClick={() => onDigit('8')} disabled={isLoading} className={numBtnClass}>
        8
      </button>
      <button onClick={() => onDigit('9')} disabled={isLoading} className={numBtnClass}>
        9
      </button>
      <button
        onClick={() => onOperator('*')}
        disabled={isLoading}
        className={opBtnClass('*')}
        title="Multiplicar (*)"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Linha 3: 4, 5, 6, Subtrair */}
      <button onClick={() => onDigit('4')} disabled={isLoading} className={numBtnClass}>
        4
      </button>
      <button onClick={() => onDigit('5')} disabled={isLoading} className={numBtnClass}>
        5
      </button>
      <button onClick={() => onDigit('6')} disabled={isLoading} className={numBtnClass}>
        6
      </button>
      <button
        onClick={() => onOperator('-')}
        disabled={isLoading}
        className={opBtnClass('-')}
        title="Subtrair (-)"
      >
        <Minus className="w-6 h-6" />
      </button>

      {/* Linha 4: 1, 2, 3, Somar */}
      <button onClick={() => onDigit('1')} disabled={isLoading} className={numBtnClass}>
        1
      </button>
      <button onClick={() => onDigit('2')} disabled={isLoading} className={numBtnClass}>
        2
      </button>
      <button onClick={() => onDigit('3')} disabled={isLoading} className={numBtnClass}>
        3
      </button>
      <button
        onClick={() => onOperator('+')}
        disabled={isLoading}
        className={opBtnClass('+')}
        title="Somar (+)"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Linha 5: Inverter sinal, 0, Ponto decimal, Igual */}
      <button
        onClick={onToggleSign}
        disabled={isLoading}
        className={funcBtnClass}
        title="Inverter sinal (±)"
      >
        ±
      </button>
      <button onClick={() => onDigit('0')} disabled={isLoading} className={numBtnClass}>
        0
      </button>
      <button
        onClick={() => onDigit('.')}
        disabled={isLoading}
        className={numBtnClass}
        title="Ponto decimal (.)"
      >
        .
      </button>
      <button
        onClick={onCalculate}
        disabled={isLoading}
        className={equalBtnClass}
        title="Calcular resultado (= ou Enter)"
      >
        <Equal className="w-6 h-6" />
      </button>
    </div>
  );
};
