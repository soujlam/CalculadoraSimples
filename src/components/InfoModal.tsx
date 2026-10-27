import React from 'react';
import { X, CheckCircle, Terminal, Layers, ExternalLink, Code2 } from 'lucide-react';
import { BackendStatus } from '../types.ts';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: BackendStatus | null;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, status }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
        {/* Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Fechar janela"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Título */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-mono font-bold text-lg">
            Py
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Arquitetura da Calculadora
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Lógica matemática 100% isolada no backend Python
            </p>
          </div>
        </div>

        {/* Informações de Status */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-100 dark:border-slate-800 mb-5">
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-500" />
            <span>Diagnóstico do Sistema</span>
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Motor Python:</span>
              <p className="font-mono font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                {status?.pythonVersion || 'Python 3.10+'}
              </p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Status da API:</span>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Online (Express + Python)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Princípios Arquiteturais */}
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
              1
            </div>
            <div>
              <h5 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                Zero lógica de cálculo no frontend
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                O cliente React nunca avalia contas com JavaScript ou <code className="font-mono text-slate-800 dark:text-slate-200">eval()</code>. Cada clique em igual despacha a operação para a rota <code className="font-mono text-slate-800 dark:text-slate-200">/api/calculate</code>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
              2
            </div>
            <div>
              <h5 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                Motor seguro com AST Python
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                O arquivo <code className="font-mono text-slate-800 dark:text-slate-200">engine/calculator.py</code> analisa a árvore sintática abstrata (<code className="font-mono">ast.parse</code>) permitindo apenas operações aritméticas válidas, prevenindo injeções de código.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
              3
            </div>
            <div>
              <h5 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                Tratamento de Exceções & Divisão por Zero
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Divisões por zero, overflow e imprecisões de ponto flutuante são tratados diretamente no Python e exibidos de forma amigável no visor.
              </p>
            </div>
          </div>
        </div>

        {/* Botão de Fechar */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-lg transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
