import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { Display } from './components/Display.tsx';
import { Keypad } from './components/Keypad.tsx';
import { HistoryPanel } from './components/HistoryPanel.tsx';
import { InfoModal } from './components/InfoModal.tsx';
import { GithubReadmeSection } from './components/GithubReadmeSection.tsx';
import { CalculationRecord, Operator, ThemeMode, BackendStatus } from './types.ts';
import { calculateWithPython } from './services/calculatorService.ts';

const GITHUB_PAGES_URL = 'https://soujlam.github.io/CalculadoraSimples/';
const APP_URL = GITHUB_PAGES_URL;

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('calc_theme') as ThemeMode;
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  const [currentInput, setCurrentInput] = useState<string>('0');
  const [storedOperand, setStoredOperand] = useState<number | null>(null);
  const [activeOperator, setActiveOperator] = useState<Operator>(null);
  const [expression, setExpression] = useState<string>('');
  const [isNewInput, setIsNewInput] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<CalculationRecord[]>([]);
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [isMobileHistoryOpen, setIsMobileHistoryOpen] = useState<boolean>(false);

  // Sincroniza o tema com a classe HTML
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('calc_theme', theme);
  }, [theme]);

  // Carrega status do backend e histórico inicial
  useEffect(() => {
    const fetchStatusAndHistory = async () => {
      try {
        const [statusRes, historyRes] = await Promise.all([
          fetch('/api/status'),
          fetch('/api/history'),
        ]);

        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setBackendStatus(statusData);
        }

        if (historyRes.ok) {
          const historyData = await historyRes.json();
          if (historyData.success && Array.isArray(historyData.history)) {
            setHistory(historyData.history);
          }
        }
      } catch (err) {
        console.warn('Backend ainda iniciando ou em conexão local:', err);
      }
    };

    fetchStatusAndHistory();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const getOperatorSymbol = (op: Operator): string => {
    switch (op) {
      case '+':
        return '+';
      case '-':
        return '-';
      case '*':
        return '×';
      case '/':
        return '÷';
      default:
        return '';
    }
  };

  // Digitação de números e ponto decimal
  const handleDigit = useCallback((digit: string) => {
    setErrorMessage(null);

    setCurrentInput((prev) => {
      if (isNewInput) {
        setIsNewInput(false);
        return digit === '.' ? '0.' : digit;
      }

      if (digit === '.') {
        if (prev.includes('.')) return prev;
        return prev + '.';
      }

      if (prev === '0') {
        return digit;
      }

      return prev + digit;
    });
  }, [isNewInput]);

  // Função auxiliar de envio de cálculo para o motor Python (Servidor ou WebAssembly)
  const executeCalculation = async (
    op1: number,
    operator: Operator,
    op2: number
  ): Promise<any> => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await calculateWithPython({
        operand1: op1,
        operator: operator,
        operand2: op2,
      });

      return result;
    } catch (err: any) {
      return {
        success: false,
        error: 'Não foi possível conectar ao motor de cálculo Python.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Seleção de operador aritmético (+, -, *, /)
  const handleOperator = useCallback(async (op: Operator) => {
    setErrorMessage(null);

    const currentVal = parseFloat(currentInput);

    // Se já havia um operador e o usuário digitou um segundo número, calcula o intermediário primeiro
    if (storedOperand !== null && activeOperator !== null && !isNewInput) {
      const result = await executeCalculation(storedOperand, activeOperator, currentVal);

      if (result.success) {
        setStoredOperand(result.result);
        setCurrentInput(result.formattedResult);
        setActiveOperator(op);
        setExpression(`${result.formattedResult} ${getOperatorSymbol(op)}`);
        setIsNewInput(true);
        if (result.historyRecord) {
          setHistory((prev) => [result.historyRecord, ...prev.slice(0, 29)]);
        }
      } else {
        setErrorMessage(result.error || 'Erro no cálculo');
        setStoredOperand(null);
        setActiveOperator(null);
      }
      return;
    }

    // Primeiro operador escolhido
    setStoredOperand(currentVal);
    setActiveOperator(op);
    setExpression(`${currentInput} ${getOperatorSymbol(op)}`);
    setIsNewInput(true);
  }, [currentInput, storedOperand, activeOperator, isNewInput]);

  // Execução do cálculo final (=)
  const handleCalculate = useCallback(async () => {
    if (storedOperand === null || activeOperator === null) return;

    const op2 = parseFloat(currentInput);
    const op1 = storedOperand;
    const op = activeOperator;

    const result = await executeCalculation(op1, op, op2);

    if (result.success) {
      setCurrentInput(result.formattedResult);
      setExpression(`${op1} ${getOperatorSymbol(op)} ${op2} =`);
      setStoredOperand(null);
      setActiveOperator(null);
      setIsNewInput(true);

      const record: CalculationRecord = result.historyRecord || {
        id: Math.random().toString(36).substring(2, 9),
        expression: `${op1} ${getOperatorSymbol(op)} ${op2}`,
        result: result.result,
        formattedResult: result.formattedResult,
        timestamp: new Date().toISOString(),
      };
      setHistory((prev) => [record, ...prev.slice(0, 29)]);
    } else {
      setErrorMessage(result.error || 'Erro no cálculo');
      setStoredOperand(null);
      setActiveOperator(null);
      setIsNewInput(true);
    }
  }, [currentInput, storedOperand, activeOperator]);

  // Limpeza total (AC)
  const handleAllClear = useCallback(() => {
    setCurrentInput('0');
    setStoredOperand(null);
    setActiveOperator(null);
    setExpression('');
    setErrorMessage(null);
    setIsNewInput(true);
  }, []);

  // Apagar último dígito (Backspace)
  const handleBackspace = useCallback(() => {
    if (errorMessage) {
      setErrorMessage(null);
      return;
    }

    if (isNewInput) return;

    setCurrentInput((prev) => {
      if (prev.length <= 1 || (prev.length === 2 && prev.startsWith('-'))) {
        setIsNewInput(true);
        return '0';
      }
      return prev.slice(0, -1);
    });
  }, [errorMessage, isNewInput]);

  // Inverter sinal (±)
  const handleToggleSign = useCallback(() => {
    if (currentInput === '0' || errorMessage) return;

    setCurrentInput((prev) => {
      if (prev.startsWith('-')) {
        return prev.substring(1);
      }
      return '-' + prev;
    });
  }, [currentInput, errorMessage]);

  // Porcentagem calculada estritamente no motor Python
  const handlePercentage = useCallback(async () => {
    if (errorMessage) return;

    setIsLoading(true);
    try {
      const result = await calculateWithPython({
        expression: `${currentInput} / 100`,
      });

      if (result.success) {
        setCurrentInput(result.formattedResult || '0');
        setExpression(`${currentInput}% =`);
        setIsNewInput(true);
      } else {
        setErrorMessage(result.error || 'Erro ao calcular porcentagem');
      }
    } catch {
      setErrorMessage('Erro ao calcular porcentagem');
    } finally {
      setIsLoading(false);
    }
  }, [currentInput, errorMessage]);

  // Reutilizar cálculo do histórico
  const handleSelectCalculation = (record: CalculationRecord) => {
    setCurrentInput(record.formattedResult);
    setExpression(`Reutilizado: ${record.expression} =`);
    setIsNewInput(true);
    setErrorMessage(null);
    setIsMobileHistoryOpen(false);
  };

  // Limpar histórico completo
  const handleClearHistory = async () => {
    try {
      await fetch('/api/history', { method: 'DELETE' });
      setHistory([]);
    } catch (err) {
      console.error('Falha ao limpar histórico:', err);
    }
  };

  // Suporte a teclado físico completo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Evita conflitos com campos de texto se houver
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === '.' || e.key === ',') {
        e.preventDefault();
        handleDigit('.');
      } else if (e.key === '+') {
        e.preventDefault();
        handleOperator('+');
      } else if (e.key === '-') {
        e.preventDefault();
        handleOperator('-');
      } else if (e.key === '*') {
        e.preventDefault();
        handleOperator('*');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('/');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleAllClear();
      } else if (e.key === '%') {
        e.preventDefault();
        handlePercentage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleDigit,
    handleOperator,
    handleCalculate,
    handleBackspace,
    handleAllClear,
    handlePercentage,
  ]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Cabeçalho */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenInfo={() => setIsInfoModalOpen(true)}
        onToggleHistory={() => setIsMobileHistoryOpen((prev) => !prev)}
        historyCount={history.length}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-center">
        {/* Banner informativo de arquitetura */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Motor: Python 3.10 com AST isolado no servidor</span>
            <span aria-hidden="true">·</span>
            <span>Zero cálculo matemático no frontend</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsInfoModalOpen(true)}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Como funciona o isolamento
            </button>
          </div>
        </div>

        {/* Grid: Calculadora + Painel de Histórico */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Coluna da Calculadora (7 colunas no desktop) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md">
            <Display
              expression={expression}
              currentInput={currentInput}
              isLoading={isLoading}
              errorMessage={errorMessage}
              pythonVersion={backendStatus?.pythonVersion}
            />

            <div className="mt-5">
              <Keypad
                onDigit={handleDigit}
                onOperator={handleOperator}
                onCalculate={handleCalculate}
                onClear={handleBackspace}
                onAllClear={handleAllClear}
                onBackspace={handleBackspace}
                onToggleSign={handleToggleSign}
                onPercentage={handlePercentage}
                activeOperator={activeOperator}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Coluna do Histórico (5 colunas no desktop) */}
          <div className="hidden lg:block lg:col-span-5 h-[530px]">
            <HistoryPanel
              history={history}
              onSelectCalculation={handleSelectCalculation}
              onClearHistory={handleClearHistory}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Modal de Histórico para telas móveis */}
        {isMobileHistoryOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden flex items-end sm:items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-4 max-h-[80vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Histórico de Operações
                </span>
                <button
                  onClick={() => setIsMobileHistoryOpen(false)}
                  className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Fechar
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <HistoryPanel
                  history={history}
                  onSelectCalculation={handleSelectCalculation}
                  onClearHistory={handleClearHistory}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Seção Documentação GitHub com Link de Acesso Público */}
        <GithubReadmeSection appUrl={APP_URL} />
      </main>

      {/* Rodapé discreto */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Calculadora Web Python · Projeto desacoplado com arquitetura limpa</span>
          <a
            href={APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors underline underline-offset-4"
          >
            Acessar no Navegador
          </a>
        </div>
      </footer>

      {/* Modal de Detalhes da Arquitetura */}
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        status={backendStatus}
      />
    </div>
  );
}
