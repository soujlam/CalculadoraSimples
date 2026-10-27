import React, { useState } from 'react';
import { Github, ExternalLink, Copy, Check, Terminal, Globe, HelpCircle } from 'lucide-react';

interface GithubReadmeSectionProps {
  appUrl: string;
}

export const GithubReadmeSection: React.FC<GithubReadmeSectionProps> = ({ appUrl }) => {
  const githubPagesUrl = 'https://soujlam.github.io/CalculadoraSimples/';
  const devCloudRunUrl = 'https://ais-dev-dmym2ihc6iz354ky24uxor-347800675442.us-east5.run.app';

  const [copiedGithubPages, setCopiedGithubPages] = useState(false);
  const [copiedCloudRun, setCopiedCloudRun] = useState(false);
  const [copiedClone, setCopiedClone] = useState(false);

  const cloneCommand = 'git clone https://github.com/soujlam/CalculadoraSimples.git\ncd CalculadoraSimples\nnpm install\nnpm run dev';

  const handleCopyGithubPages = () => {
    navigator.clipboard.writeText(githubPagesUrl);
    setCopiedGithubPages(true);
    setTimeout(() => setCopiedGithubPages(false), 1500);
  };

  const handleCopyCloudRun = () => {
    navigator.clipboard.writeText(devCloudRunUrl);
    setCopiedCloudRun(true);
    setTimeout(() => setCopiedCloudRun(false), 1500);
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
                <span>Repositório: soujlam/CalculadoraSimples</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Guia de URLs e publicação para acesso no navegador
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/soujlam/CalculadoraSimples"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Ver no GitHub</span>
            </a>
          </div>
        </div>

        {/* Links de Acesso Web */}
        <div className="my-6 space-y-4">
          {/* Opção 1: GitHub Pages Oficial */}
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                    URL no GitHub Pages (Web no GitHub)
                  </span>
                </div>
                <a
                  href={githubPagesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-blue-700 dark:text-blue-400 font-semibold underline underline-offset-2 break-all"
                >
                  {githubPagesUrl}
                </a>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Ativada nas configurações do repositório: <strong>Settings &gt; Pages</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyGithubPages}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shrink-0"
                >
                  {copiedGithubPages ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Opção 2: Google Cloud Run (Ambiente de Desenvolvimento Ativo) */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  URL de Desenvolvimento Ativo (Google Cloud Run)
                </span>
                <a
                  href={devCloudRunUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-slate-600 dark:text-slate-300 underline underline-offset-2 break-all"
                >
                  {devCloudRunUrl}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={devCloudRunUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <span>Abrir Agora</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={handleCopyCloudRun}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shrink-0"
                >
                  {copiedCloudRun ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Passo a passo para ativar o GitHub Pages */}
        <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 mb-6 text-xs text-amber-900 dark:text-amber-200">
          <div className="font-semibold flex items-center gap-1.5 mb-1.5">
            <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Por que apareceu "Page not found"?</span>
          </div>
          <p className="leading-relaxed">
            Se você acessou o GitHub Pages antes de ativá-lo, o GitHub retorna <em>"Page not found"</em> até que a publicação seja concluída.
            Para ativar em seu repositório:
          </p>
          <ol className="list-decimal list-inside mt-2 space-y-1 pl-1">
            <li>Abra <strong>https://github.com/soujlam/CalculadoraSimples</strong></li>
            <li>Clique na aba <strong>Settings</strong> &gt; menu lateral <strong>Pages</strong></li>
            <li>Em <em>Source</em>, selecione <strong>Deploy from a branch</strong></li>
            <li>Escolha a branch <strong>main</strong> e no campo ao lado selecione a pasta <strong>/docs</strong> (importante: selecione <em>/docs</em> e não <em>/(root)</em> para carregar a versão compilada).</li>
            <li>Clique em <strong>Save</strong>. Pronto! O erro de <em>main.tsx</em> desaparecerá.</li>
          </ol>
        </div>

        {/* Comandos para rodar localmente */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-slate-500" />
              <span>Como clonar e executar localmente</span>
            </span>

            <button
              onClick={handleCopyClone}
              className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
            >
              {copiedClone ? (
                <span className="text-emerald-500 font-medium">Copiado!</span>
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
