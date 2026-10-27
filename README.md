# 🧮 Calculadora Web com Backend em Python

[![Status](https://img.shields.io/badge/Status-Online-success.svg)](#)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-3178C6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38B2AC.svg)](https://tailwindcss.com/)

Um aplicativo web moderno e intuitivo de calculadora aritmética simples, projetado com **arquitetura estritamente desacoplada**: toda a lógica matemática e de processamento de cálculos é executada no **backend em Python**, mantendo o frontend completamente livre de qualquer cálculo aritmético direto.

---

## 🌐 Links de Acesso da Calculadora no Navegador

### 1. Link Oficial no GitHub Pages
Se você publicou o repositório com o GitHub Pages ativado, a URL padrão do seu projeto é:

👉 **[https://soujlam.github.io/CalculadoraSimples/](https://soujlam.github.io/CalculadoraSimples/)**

> **⚠️ Como resolver o erro `GET /src/main.tsx 404` no GitHub Pages:**
> O arquivo `index.html` da raiz é para desenvolvimento (aponta para código fonte TypeScript). Para publicar a versão compilada, escolha uma das opções abaixo no GitHub:
> - **Opção Recomendada (1 clique):** Vá em **Settings > Pages**, em *Branch* selecione `main` e troque a pasta de `/(root)` para **/docs**, e clique em **Save**.
> - **Opção Automática (GitHub Actions):** Vá em **Settings > Pages**, e em *Source* selecione **GitHub Actions**. O arquivo `.github/workflows/deploy.yml` fará o build automaticamente.

### 2. Link no Google Cloud Run (Ambiente Ativo)
Você também pode acessar a aplicação rodando no servidor Cloud Run:

👉 **[https://ais-dev-dmym2ihc6iz354ky24uxor-347800675442.us-east5.run.app](https://ais-dev-dmym2ihc6iz354ky24uxor-347800675442.us-east5.run.app)**

---

## 🎯 Destaques do Projeto

- **Lógica Longe do Frontend**: O cliente web (React) funciona exclusivamente como camada de apresentação e captura de eventos. Não há nenhum `eval()` ou operação matemática efetuada no JavaScript.
- **Motor Seguro em Python (`engine/calculator.py`)**: Utiliza a Árvore Sintática Abstrata do Python (`ast.parse`) para avaliar expressões de forma segura contra injeções de código, garantindo precisão decimal e tratamento robusto de erros (como divisão por zero).
- **Interface Moderna e Responsiva**:
  - Visor digital com números tabulares (`tabular-nums`) para evitar oscilações visuais.
  - Alternador instantâneo entre tema claro e tema escuro.
  - Suporte completo ao teclado físico (números `0-9`, `+`, `-`, `*`, `/`, `Enter` ou `=`, `Backspace`, `Esc`).
  - Botão de cópia rápida do resultado para a área de transferência.
- **Painel de Histórico de Cálculos**:
  - Armazena as operações recentes com data/hora.
  - Permite reutilizar o resultado de cálculos anteriores com um clique.
  - Opção de limpar todo o histórico de registros.

---

## 🏗️ Arquitetura do Sistema

```text
┌─────────────────────────────────────────────────────────────┐
│                    Navegador Web / Cliente                  │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ App.tsx (React + Tailwind CSS)                      │   │
│   │ ├─ Visor Digital (Display com números tabulares)    │   │
│   │ ├─ Teclado Tátil & Atalhos de Teclado Físico        │   │
│   │ └─ Painel de Histórico com Reuso e Limpeza          │   │
│   └──────────────────────────┬──────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────┘
                               │ HTTP POST /api/calculate
                               │ HTTP GET  /api/history
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Servidor Backend (server.ts)                │
│                                                             │
│  - Roteamento Express na porta 3000                         │
│  - Sanitização de payload e validação de parâmetros         │
│  - Despacho seguro de subprocesso para o Python             │
└──────────────────────────────┬──────────────────────────────┘
                               │ Execução isolada com argumentos
                               ▼
┌─────────────────────────────────────────────────────────────┐
│            Motor de Cálculo Python (engine/calculator.py)   │
│                                                             │
│  - Análise sintática com ast.parse (AST segura)             │
│  - Operações: +, -, *, /, % com precisão decimal            │
│  - Detecção e tratamento de ZeroDivisionError               │
│  - Retorno formatado em JSON estruturado                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Arquivos

```text
├── engine/
│   └── calculator.py        # Motor aritmético seguro em Python (lógica isolada)
├── server.ts                # Servidor Express com API REST e chamadas ao Python
├── src/
│   ├── components/
│   │   ├── Display.tsx      # Visor digital com suporte a cópia e auto-ajuste
│   │   ├── Header.tsx       # Barra de navegação e alternador de tema
│   │   ├── HistoryPanel.tsx # Painel de histórico de cálculos
│   │   ├── InfoModal.tsx    # Modal de arquitetura e diagnóstico
│   │   ├── Keypad.tsx       # Teclado numérico ergonômico
│   │   └── GithubReadmeSection.tsx # Seção de documentação no app
│   ├── types.ts             # Tipos TypeScript compartilhados
│   ├── App.tsx              # Componente raiz e gerenciador de estado
│   ├── main.tsx             # Ponto de entrada do React
│   └── index.css            # Estilos globais e fontes tipográficas
├── index.html               # Documento HTML principal
├── package.json             # Dependências Node.js e scripts
└── README.md                # Documentação oficial do repositório
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js** (v18 ou superior)
- **Python** (v3.10 ou superior)

### 1. Clonar o Repositório
```bash
git clone https://github.com/soujlam/CalculadoraSimples.git
cd CalculadoraSimples
```

### 2. Instalar as Dependências
```bash
npm install
```

### 3. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

O aplicativo estará disponível em seu navegador no endereço:
👉 `http://localhost:3000`

---

## 📡 Referência da API Backend

### `POST /api/calculate`
Envia os dados de uma operação para processamento no motor Python.

**Exemplo de Requisição (Operação Binária):**
```json
{
  "operand1": 45,
  "operator": "*",
  "operand2": 12
}
```

**Exemplo de Resposta de Sucesso:**
```json
{
  "success": true,
  "expression": "45 * 12",
  "result": 540,
  "formattedResult": "540"
}
```

**Exemplo de Resposta em caso de Divisão por Zero:**
```json
{
  "success": false,
  "error": "Divisão por zero não é permitida"
}
```

### `GET /api/history`
Retorna a lista dos cálculos recentes realizados no servidor.

### `DELETE /api/history`
Limpa todos os registros do histórico de cálculos.

### `GET /api/status`
Retorna a versão ativa do Python e a integridade da comunicação entre Node.js e Python.

---

## 📄 Licença

Distribuído sob a licença **Apache-2.0**.
