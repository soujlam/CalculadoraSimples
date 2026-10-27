import React from 'react';
import { Sun, Moon, Info, Clock, Github } from 'lucide-react';
import { ThemeMode } from '../types.ts';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenInfo: () => void;
  onToggleHistory: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenInfo,
  onToggleHistory,
  historyCount,
}) => {
  return (
    <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#"
          className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-mono flex items-center justify-center text-sm font-semibold shadow-sm">
            Py
          </span>
          <span>Calculadora Python</span>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          <button
            onClick={onOpenInfo}
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            Arquitetura
          </button>
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
          <a
            href="#readme"
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            Guia GitHub
          </a>
        </nav>

        {/* Zone 3: Actions & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onToggleHistory}
            title="Ver histórico de cálculos"
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Clock className="w-5 h-5" />
          </button>

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
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>
        </div>
      </div>
    </header>
  );
};
