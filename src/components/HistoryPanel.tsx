import React from 'react';
import { Trash2, History as HistoryIcon, ArrowUpRight } from 'lucide-react';
import { CalculationRecord } from '../types.ts';

interface HistoryPanelProps {
  history: CalculationRecord[];
  onSelectCalculation: (record: CalculationRecord) => void;
  onClearHistory: () => void;
  isLoading: boolean;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onSelectCalculation,
  onClearHistory,
  isLoading,
}) => {
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
      {/* Cabeçalho do Painel */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <HistoryIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
            Histórico Recente
          </h2>
          {history.length > 0 && (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              ({history.length})
            </span>
          )}
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors px-2 py-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40"
            title="Limpar todos os registros"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar</span>
          </button>
        )}
      </div>

      {/* Lista de Cálculos */}
      <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1 max-h-[460px] scrollbar-thin">
        {history.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500">
            <HistoryIcon className="w-8 h-8 stroke-1 mb-2 opacity-50" />
            <p className="text-sm font-medium">Nenhum cálculo registrado ainda</p>
            <p className="text-xs mt-1 text-slate-400 dark:text-slate-500">
              Faça cálculos na calculadora para acompanhar o histórico aqui.
            </p>
          </div>
        ) : (
          history.map((record) => (
            <button
              key={record.id}
              onClick={() => onSelectCalculation(record)}
              className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 transition-all border border-slate-100 dark:border-slate-800 group relative flex flex-col justify-between"
              title="Clique para carregar este valor no visor"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span className="font-mono">{record.expression} =</span>
                <span className="text-[11px]">{formatTime(record.timestamp)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-mono-numbers text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {record.formattedResult}
                </span>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                  <span>Reutilizar</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
