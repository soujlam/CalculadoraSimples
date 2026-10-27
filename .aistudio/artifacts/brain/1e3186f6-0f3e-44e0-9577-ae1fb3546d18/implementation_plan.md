# Calculadora Web com Backend Python (GitHub Ready)

Aplicativo web completo de calculadora aritmética simples, onde toda a lógica de cálculo é estritamente isolada no backend em Python, apresentando uma interface moderna e responsiva com alternância de tema claro/escuro, painel de histórico de operações e documentação `README.md` com link direto de acesso para publicação no GitHub.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Decisões confirmadas pelo usuário na fase de alinhamento:**
> - **Escopo de Operações**: Operações aritméticas básicas (adição, subtração, multiplicação e divisão) com suporte a decimais e tratamento de divisão por zero.
> - **Estilo Visual**: Interface moderna, minimalista e ergonômica com alternância rápida entre temas claro e escuro.
> - **Histórico de Cálculos**: Painel lateral/inferior de histórico em tempo real com opção de reutilizar cálculos anteriores e botão para limpar registros.
> - **Isolamento da Lógica**: A lógica matemática reside 100% no arquivo Python `engine/calculator.py`, acessado pelo frontend via endpoint de API sem nenhuma avaliação matemática no cliente.
> - **Documentação para GitHub**: Arquivo `README.md` completo com links diretos de teste em produção, arquitetura explicada e instruções de execução.

---

## 1. Overview & Core Concept

- **O que faz**: Oferece uma calculadora web simples, rápida e precisa. O usuário digita valores e operações através do teclado numérico na tela ou do teclado físico. Cada cálculo é despachado para um serviço backend em Python que executa o cálculo com segurança e retorna o resultado numérico exato, a expressão formatada e o registro do histórico.
- **Público-alvo**: Usuários que buscam uma ferramenta de cálculo ágil e intuitiva no navegador, e desenvolvedores/avaliadores no GitHub interessados em uma arquitetura limpa com separação de responsabilidades (frontend React/Tailwind + backend Python).
- **Valor Principal**: Separação total de camadas (Frontend React não faz cálculo; o cálculo é feito em Python), alta usabilidade em desktop e mobile, e documentação pronta para repositório GitHub com link funcional.

---

## 2. User Experience & Visual Design

### Fluxo do Usuário
1. **Entrada e Exibição**: O usuário visualiza o visor digital com números tabulares (`tabular-nums`), mostrando o cálculo atual e o valor em digitação.
2. **Interação**: Pode clicar nos botões táteis ou usar o teclado físico (números `0-9`, `+`, `-`, `*`, `/`, `Enter` ou `=` para calcular, `Backspace` para apagar e `Esc` ou `C` para limpar).
3. **Execução no Backend**: Ao pressionar `=`, uma requisição assíncrona envia os dados para a API Python, que processa a expressão e retorna o resultado.
4. **Histórico Interativo**: Cada operação resolvida é salva no histórico. O usuário pode clicar em um cálculo passado para carregá-lo novamente no visor ou clicar em "Limpar Histórico".
5. **Alternância de Tema**: Botão dedicado no cabeçalho permite alternar instantaneamente entre o modo escuro (tons neutros profundos de ardósia) e claro (superfícies limpas e nítidas).

### Identidade Visual e Estilo
- **Direção Estética**: Minimalismo funcional com foco em ergonomia e precisão matemática.
- **Paleta de Cores**:
  - Tema Escuro: Fundo `#090D16` / `#0F172A`, superfícies da calculadora `#1E293B`, teclas numéricas `#334155`, operadores com destaque em azul/índigo vibrante `#3B82F6` / `#2563EB`, tecla de igual em destaque primário `#0284C7` e ações destrutivas (limpar) em coral sutil.
  - Tema Claro: Fundo `#F8FAFC`, superfícies `#FFFFFF`, teclas numéricas `#F1F5F9`, bordas suaves `#E2E8F0`, operadores com fundo azul claro e texto contrastante.
- **Tipografia**: Família sem serifa moderna para a interface e fonte monoespaçada com números tabulares (`font-mono tabular-nums`) para o visor e histórico, evitando qualquer salto visual durante a digitação.
- **Feedback Tátil**: Animações sutis de clique (`active:scale-95`), transições de cor suaves e indicação do operador ativo.

---

## 3. Key Product Decisions & Trade-Offs

- **Decisão 1: Lógica do Cálculo em Python Isolado**
  - *Abordagem Escolhida*: Criação de um módulo Python dedicado (`engine/calculator.py`) chamado pelo servidor Express em `/api/calculate`.
  - *Por que*: Atende rigorosamente ao requisito do usuário de que a linguagem do cálculo seja Python e que a lógica fique totalmente longe do frontend. Garante sanitização rigorosa de entradas sem risco de injeção ou uso de `eval()` perigoso no frontend.
  - *Alternativas Consideradas*: Avaliação no client-side em JavaScript (rejeitada por violar o requisito explícito de Python e lógica desacoplada).

- **Decisão 2: Persistência e Gerenciamento do Histórico**
  - *Abordagem Escolhida*: Histórico gerenciado com endpoints no backend (`/api/history`, `/api/history/clear`) sincronizado com o frontend.
  - *Por que*: Mantém a consistência de estado e permite que o usuário limpe os registros a qualquer momento com um clique.

- **Decisão 3: Documentação GitHub e Links Públicos**
  - *Abordagem Escolhida*: Elaboração de um `README.md` profissional em padrão internacional e português, com badges de status, links diretos de acesso via navegador para o app publicado, guia de arquitetura e instruções de clone/execução local.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Navegador Web / Cliente                  │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ App.tsx                                             │   │
│   │ ├─ Header (Título, Alternador de Tema Claro/Escuro) │   │
│   │ ├─ CalculatorDisplay (Visor com tabular-nums)       │   │
│   │ ├─ Keypad (Grade de botões numéricos e operadores)  │   │
│   │ └─ HistoryPanel (Lista de cálculos, reuso e limpar) │   │
│   └──────────────────────────┬──────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────┘
                               │ HTTP POST /api/calculate
                               │ HTTP GET  /api/history
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Servidor Backend (server.ts)                │
│                                                             │
│  - Roteamento Express na porta 3000                         │
│  - Validação de entrada e sanitização de requisições        │
│  - Despacho seguro para o processo Python                   │
└──────────────────────────────┬──────────────────────────────┘
                               │ stdin / stdout JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│            Motor de Cálculo Python (engine/calculator.py)   │
│                                                             │
│  - Parse seguro de expressões aritméticas                   │
│  - Execução: +, -, *, / com precisão decimal                │
│  - Detecção de erros (divisão por zero, overflow, sintaxe)  │
│  - Retorno em JSON estruturado com status e resultado       │
└─────────────────────────────────────────────────────────────┘
```

### Contrato da API Backend

1. **`POST /api/calculate`**
   - **Corpo da Requisição**:
     ```json
     {
       "expression": "45 * 12 + 8",
       "operand1": 45,
       "operator": "*",
       "operand2": 12
     }
     ```
   - **Resposta de Sucesso**:
     ```json
     {
       "success": true,
       "result": 548,
       "formattedResult": "548",
       "expression": "45 * 12 + 8",
       "timestamp": "2026-10-27T21:15:00Z"
     }
     ```
   - **Resposta de Erro** (ex: divisão por zero):
     ```json
     {
       "success": false,
       "error": "Divisão por zero não permitida"
     }
     ```

2. **`GET /api/history`**: Retorna a lista dos cálculos recentes realizados.
3. **`DELETE /api/history`**: Limpa todo o histórico de operações.

### Estrutura de Arquivos Planejada
- `server.ts`: Servidor Node/Express com endpoints `/api/*` e integração com o script Python.
- `engine/calculator.py`: Script Python com funções puras de parsing e cálculo aritmético seguro.
- `src/App.tsx`: Interface principal da calculadora com suporte a teclado físico e atalhos.
- `src/components/Keypad.tsx`: Grade de botões táteis e ergonômicos.
- `src/components/Display.tsx`: Visor com animação de atualização e formatação decimal.
- `src/components/History.tsx`: Painel lateral/gaveta de histórico com ações de reuso e limpeza.
- `README.md`: Documentação com descrição, arquitetura, link de acesso web no navegador e instruções para o GitHub.
- `metadata.json` e `index.html`: Atualizados com título e metadados oficiais da aplicação.
