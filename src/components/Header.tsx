import React from 'react';
import { Sun, Moon, Info, Clock, Github, Code2, Calculator } from 'lucide-react';
import { ThemeMode, AppTab } from '../types.ts';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenInfo: () => void;
  onToggleHistory: () => void;
  historyCount: number;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenInfo,
  onToggleHistory,
  historyCount,
  activeTab,
  onSelectTab,
}) => {
  return (
    <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onSelectTab('calculator')}
          className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-mono flex items-center justify-center text-sm font-semibold shadow-sm">
            Py
          </span>
          <span>Calculadora Python</span>
        </button>

        {/* Zone 2: Navigation Links & Tab Switchers */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          <button
            onClick={() => onSelectTab('calculator')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'calculator'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Calculadora</span>
          </button>

          <button
            onClick={() => onSelectTab('python-code')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'python-code'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Código Python Explicado</span>
          </button>

          {activeTab === 'calculator' && (
            <button
              onClick={onToggleHistory}
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <span>Histórico</span>
              {historyCount > 0 && (
                <span className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                  ({historyCount})
                </span>
              )}
            </button>
          )}

          <a
            href="https://github.com/soujlam/CalculadoraSimples"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </nav>

        {/* Zone 3: Actions & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Seletor de abas mobile */}
          <div className="flex md:hidden items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mr-1">
            <button
              onClick={() => onSelectTab('calculator')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'calculator'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Calculadora"
            >
              <Calculator className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectTab('python-code')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'python-code'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Código Python"
            >
              <Code2 className="w-4 h-4" />
            </button>
          </div>

          {activeTab === 'calculator' && (
            <button
              onClick={onToggleHistory}
              title="Ver histórico de cálculos"
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Clock className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={onOpenInfo}
            title="Sobre a arquitetura Python"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Info className="w-5 h-5" />
          </button>

          <button
            onClick={onToggleTheme}
            title={`Mudar para modo ${theme === 'dark' ? 'claro' : 'escuro'}`}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
