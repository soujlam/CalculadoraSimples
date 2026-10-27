import React, { useState } from 'react';
import { Github, ExternalLink, Copy, Check, Terminal, BookOpen } from 'lucide-react';

interface GithubReadmeSectionProps {
  appUrl: string;
}

export const GithubReadmeSection: React.FC<GithubReadmeSectionProps> = ({ appUrl }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedClone, setCopiedClone] = useState(false);

  const cloneCommand = 'git clone https://github.com/usuario/calculadora-python-web.git\ncd calculadora-python-web\nnpm install\nnpm run dev';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1500);
  };

  const handleCopyClone = () => {
    navigator.clipboard.writeText(cloneCommand);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 1500);
  };

  return (
    <section id="readme" className="w-full mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        {/* Cabeçalho da seção */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-800">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Documentação do Repositório GitHub</span>
                <span className="text-xs px-2 py-0.5 rounded font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-normal">
                  README.md
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Link público direto de acesso e instruções de execução local
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Abrir no Navegador</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Card de destaque com o link público direto exigido no README */}
        <div className="my-6 p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-blue-900 dark:text-blue-300 uppercase tracking-wider block mb-1">
                Link de Acesso da Calculadora no Navegador (Web App URL)
              </span>
              <a
                href={appUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs sm:text-sm text-blue-700 dark:text-blue-400 underline underline-offset-2 break-all"
              >
                {appUrl}
              </a>
            </div>

            <button
              onClick={handleCopyLink}
              className="self-start sm:self-center px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors flex items-center gap-1.5 shrink-0"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Link Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Resumo dos comandos para rodar o projeto */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-slate-500" />
              <span>Como executar localmente via terminal</span>
            </span>

            <button
              onClick={handleCopyClone}
              className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
            >
              {copiedClone ? (
                <span className="text-emerald-500 font-medium">Comandos copiados</span>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copiar comandos</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800">
            <code>{cloneCommand}</code>
          </pre>
        </div>
      </div>
    </section>
  );
};
