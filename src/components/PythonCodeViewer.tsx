import React, { useState, useRef } from 'react';
import {
  Code2,
  Copy,
  Check,
  Shield,
  Sparkles,
  FileCode,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface CodeComponentInfo {
  id: string;
  name: string;
  badge: string;
  lineStart: number;
  lineEnd: number;
  summary: string;
  role: string;
  howItWorks: string[];
  keyHighlight: string;
}

const PYTHON_COMPONENTS: CodeComponentInfo[] = [
  {
    id: 'operators',
    name: '1. Whitelist de Operadores Seguros (OPERATORS)',
    badge: 'Segurança & Whitelist',
    lineStart: 14,
    lineEnd: 23,
    summary:
      'Dicionário que restringe expressamente as operações matemáticas aceitas pelo interpretador.',
    role: 'Impede a execução de códigos maliciosos ou comandos arbitrários, permitindo estritamente matemática aritmética pura.',
    howItWorks: [
      'Mapeia os nós da Árvore Sintática (ex: ast.Add, ast.Mult) diretamente para funções do módulo operator (operator.add, operator.mul).',
      'Atua como um filtro rigoroso: qualquer operação fora dessa lista é imediatamente rejeitada antes de rodar.',
    ],
    keyHighlight: 'OPERATORS = {\n    ast.Add: operator.add,\n    ast.Sub: operator.sub,\n    ast.Mult: operator.mul,\n    ast.Div: operator.truediv,\n    ast.Mod: operator.mod,\n    ast.USub: operator.neg,\n    ast.UAdd: operator.pos,\n}',
  },
  {
    id: 'clean_expression',
    name: '2. Normalizador de Expressões (clean_expression)',
    badge: 'Higienização de Entrada',
    lineStart: 25,
    lineEnd: 31,
    summary:
      'Padroniza e limpa a string digitada pelo usuário antes de passar para o compilador AST.',
    role: 'Garante que os símbolos gráficos de calculadoras (×, ÷, vírgula) sejam compatíveis com a sintaxe padrão do Python.',
    howItWorks: [
      'Substitui o caractere de multiplicação "×" e "x" pelo operador matemático "*".',
      'Substitui o caractere de divisão "÷" pelo operador "/".',
      'Converte a vírgula decimal brasileira "," para o ponto decimal "." do padrão Python.',
      'Remove espaços desnecessários nas extremidades com .strip().',
    ],
    keyHighlight: 'def clean_expression(raw_expr: str) -> str:\n    expr = raw_expr.strip()\n    expr = expr.replace(\'×\', \'*\').replace(\'x\', \'*\').replace(\'X\', \'*\')\n    expr = expr.replace(\'÷\', \'/\')\n    expr = expr.replace(\',\', \'.\')\n    return expr',
  },
  {
    id: 'eval_node',
    name: '3. Avaliador Recursivo de AST (eval_node)',
    badge: 'Coração da Avaliação Segura',
    lineStart: 33,
    lineEnd: 66,
    summary:
      'Navega recursivamente pela Árvore Sintática Abstrata (AST) calculando operandos com base na precedência natural.',
    role: 'Substitui a vulnerabilidade crítica da função nativa eval(), garantindo que apenas números e operadores válidos sejam calculados.',
    howItWorks: [
      'Se o nó for ast.Constant, valida se o valor é int ou float e o extrai.',
      'Se o nó for ast.BinOp (operação binária), resolve primeiro recursivamente a subárvore esquerda (left) e a direita (right).',
      'Interrompe e lança ZeroDivisionError se identificar uma divisão por zero (right == 0).',
      'Aplica a função aritmética mapeada: OPERATORS[op_type](left, right).',
    ],
    keyHighlight: 'if isinstance(node, ast.BinOp):\n    left = eval_node(node.left)\n    right = eval_node(node.right)\n    op_type = type(node.op)\n    if op_type == ast.Div and right == 0:\n        raise ZeroDivisionError("Divisão por zero não é permitida")\n    return OPERATORS[op_type](left, right)',
  },
  {
    id: 'format_number',
    name: '4. Formatador Numérico de Precisão (format_number)',
    badge: 'Precisão de Ponto Flutuante',
    lineStart: 68,
    lineEnd: 79,
    summary:
      'Corrige imprecisões decimais binárias de computadores e remove casas decimais excedentes.',
    role: 'Evita problemas clássicos de ponto flutuante como "0.1 + 0.2 = 0.30000000000000004" e formata números inteiros sem ".0".',
    howItWorks: [
      'Se o resultado for um número inteiro, devolve str(val) diretamente.',
      'Arredonda números fracionários para 10 casas decimais com round(val, 10).',
      'Elimina zeros residuais e pontos soltos com .rstrip(\'0\').rstrip(\'.\').',
    ],
    keyHighlight: 'rounded = round(val, 10)\nif rounded == int(rounded):\n    return str(int(rounded))\nreturn f"{rounded:.10f}".rstrip(\'0\').rstrip(\'.\')',
  },
  {
    id: 'calculate',
    name: '5. Controlador Central e Exceções (calculate / calculate_binary)',
    badge: 'Orquestração & Tratamento de Erros',
    lineStart: 81,
    lineEnd: 152,
    summary:
      'Gera a árvore sintática com ast.parse(), orquestra a execução e captura todas as exceções.',
    role: 'Garante que o backend nunca caia diante de entradas inválidas, retornando sempre mensagens de erro amigáveis.',
    howItWorks: [
      'Gera a árvore sintática via ast.parse(cleaned, mode=\'eval\').',
      'Executa eval_node() dentro de um bloco try/except seguro.',
      'Captura ZeroDivisionError e devolve {"success": false, "error": "Divisão por zero não é permitida"}.',
      'Captura erros de digitação (SyntaxError, ValueError) e devolve a mensagem clara correspondente.',
    ],
    keyHighlight: 'try:\n    parsed_ast = ast.parse(cleaned, mode=\'eval\')\n    raw_result = eval_node(parsed_ast)\n    return {"success": True, "result": num_result, "formattedResult": formatted}\nexcept ZeroDivisionError:\n    return {"success": False, "error": "Divisão por zero não é permitida"}',
  },
  {
    id: 'main',
    name: '6. Interface CLI e Comunicação JSON (main)',
    badge: 'Ponte com Servidor & Linha de Comando',
    lineStart: 154,
    lineEnd: 190,
    summary:
      'Permite que o script seja chamado pelo servidor Express ou via terminal como um processo independente.',
    role: 'Mantém o desacoplamento completo: o Node.js apenas despacha JSON para o Python e lê o JSON de resposta pela saída padrão (stdout).',
    howItWorks: [
      'Analisa se foram passados argumentos na linha de comando (sys.argv com a flag --json).',
      'Lê da entrada padrão (sys.stdin) caso seja chamado via pipe.',
      'Faz o parse do JSON de entrada e chama calculate() ou calculate_binary().',
      'Serializa o resultado em JSON puro com json.dumps() e imprime no stdout.',
    ],
    keyHighlight: 'data = json.loads(input_data)\nres = calculate_binary(float(data["operand1"]), str(data["operator"]), float(data["operand2"]))\nprint(json.dumps(res, ensure_ascii=False))',
  },
];

const FULL_PYTHON_CODE = `#!/usr/bin/env python3
"""
Módulo de Cálculo da Calculadora Web
Toda a lógica matemática e validação aritmética é executada aqui, de forma
completamente isolada do frontend.
"""

import sys
import json
import ast
import operator
from decimal import Decimal, InvalidOperation

# Operadores suportados
OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Mod: operator.mod,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}

def clean_expression(raw_expr: str) -> str:
    """Normaliza símbolos de operadores comuns para operadores Python padrão."""
    expr = raw_expr.strip()
    expr = expr.replace('×', '*').replace('x', '*').replace('X', '*')
    expr = expr.replace('÷', '/')
    expr = expr.replace(',', '.')
    return expr

def eval_node(node):
    """Avaliação recursiva segura da árvore sintática (AST) sem uso de eval()."""
    if isinstance(node, ast.Expression):
        return eval_node(node.body)

    # Valores literais numéricos (Python 3.8+)
    if isinstance(node, ast.Constant):
        if isinstance(node.value, (int, float)):
            return node.value
        raise ValueError(f"Tipo de valor não suportado: {type(node.value).__name__}")

    # Operações binárias (+, -, *, /, %)
    if isinstance(node, ast.BinOp):
        left = eval_node(node.left)
        right = eval_node(node.right)
        op_type = type(node.op)

        if op_type not in OPERATORS:
            raise ValueError(f"Operador não suportado: {op_type.__name__}")

        if op_type == ast.Div and right == 0:
            raise ZeroDivisionError("Divisão por zero não é permitida")

        return OPERATORS[op_type](left, right)

    # Operadores unários (-5, +3)
    if isinstance(node, ast.UnaryOp):
        operand = eval_node(node.operand)
        op_type = type(node.op)
        if op_type not in OPERATORS:
            raise ValueError(f"Operador unário não suportado: {op_type.__name__}")
        return OPERATORS[op_type](operand)

    raise ValueError(f"Expressão inválida com nó: {type(node).__name__}")

def format_number(val: float | int) -> str:
    """Formata o número removendo casas decimais desnecessárias e arredondando imprecisões."""
    if isinstance(val, int):
        return str(val)

    # Arredondar para até 10 casas decimais para evitar 0.30000000000000004
    rounded = round(val, 10)
    if rounded == int(rounded):
        return str(int(rounded))

    formatted = f"{rounded:.10f}".rstrip('0').rstrip('.')
    return formatted

def calculate(expression_str: str) -> dict:
    """Executa o cálculo de forma segura e retorna o dicionário com os resultados."""
    if not expression_str or not expression_str.strip():
        return {
            "success": False,
            "error": "Expressão vazia"
        }

    cleaned = clean_expression(expression_str)

    try:
        parsed_ast = ast.parse(cleaned, mode='eval')
        raw_result = eval_node(parsed_ast)

        # Tratar tipos especiais
        if isinstance(raw_result, complex):
            return {
                "success": False,
                "error": "Números complexos não são suportados"
            }

        formatted = format_number(raw_result)
        num_result = int(formatted) if '.' not in formatted else float(formatted)

        return {
            "success": True,
            "expression": expression_str,
            "normalizedExpression": cleaned,
            "result": num_result,
            "formattedResult": formatted
        }

    except ZeroDivisionError:
        return {
            "success": False,
            "error": "Divisão por zero não é permitida",
            "expression": expression_str
        }
    except (SyntaxError, ValueError) as e:
        return {
            "success": False,
            "error": f"Erro de sintaxe na expressão: {str(e)}",
            "expression": expression_str
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Erro ao processar cálculo: {str(e)}",
            "expression": expression_str
        }

def calculate_binary(op1: float, operator_symbol: str, op2: float) -> dict:
    """Calcula uma operação binária direta entre dois operandos."""
    op_map = {
        '+': '+',
        '-': '-',
        '*': '*',
        '×': '*',
        'x': '*',
        '/': '/',
        '÷': '/',
        '%': '%'
    }
    cleaned_op = op_map.get(operator_symbol)
    if not cleaned_op:
        return {"success": False, "error": f"Operador desconhecido: '{operator_symbol}'"}

    str_op1 = str(int(op1)) if op1.is_integer() else str(op1)
    str_op2 = str(int(op2)) if op2.is_integer() else str(op2)

    expr = f"{str_op1} {cleaned_op} {str_op2}"
    return calculate(expr)

def main():
    """Interface CLI para chamada via linha de comando ou pipe JSON."""
    input_data = ""

    # Se argumentos foram passados na linha de comando, usa-os diretamente
    if len(sys.argv) > 1:
        if sys.argv[1] == '--json' and len(sys.argv) > 2:
            input_data = sys.argv[2]
        else:
            input_data = " ".join(sys.argv[1:])
    elif not sys.stdin.isatty():
        input_data = sys.stdin.read().strip()

    if not input_data:
        print(json.dumps({"success": False, "error": "Nenhum dado recebido"}))
        sys.exit(1)

    # Pode ser JSON ou texto simples de expressão
    try:
        data = json.loads(input_data)
        if isinstance(data, dict):
            if "operand1" in data and "operator" in data and "operand2" in data:
                res = calculate_binary(float(data["operand1"]), str(data["operator"]), float(data["operand2"]))
            elif "expression" in data:
                res = calculate(str(data["expression"]))
            else:
                res = {"success": False, "error": "Parâmetros JSON inválidos"}
        else:
            res = calculate(str(data))
    except json.JSONDecodeError:
        res = calculate(input_data)

    print(json.dumps(res, ensure_ascii=False))

if __name__ == "__main__":
    main()`;

export const PythonCodeViewer: React.FC = () => {
  const [selectedComponentId, setSelectedComponentId] = useState<string>('operators');
  const [copied, setCopied] = useState<boolean>(false);
  const codeContainerRef = useRef<HTMLDivElement>(null);

  const selectedComponent =
    PYTHON_COMPONENTS.find((c) => c.id === selectedComponentId) || PYTHON_COMPONENTS[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(FULL_PYTHON_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSelectComponent = (comp: CodeComponentInfo) => {
    setSelectedComponentId(comp.id);

    // Rola o editor de código suavemente até a linha do componente
    if (codeContainerRef.current) {
      const lineElement = codeContainerRef.current.querySelector(
        `[data-line-number="${comp.lineStart}"]`
      );
      if (lineElement) {
        lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const codeLines = FULL_PYTHON_CODE.split('\n');

  return (
    <div className="w-full space-y-6">
      {/* Cabeçalho do Visualizador de Código */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-mono font-bold text-lg shadow-sm">
            Py
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Código-Fonte em Python
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                engine/calculator.py
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Código não-editável com análise interativa dos principais componentes matemáticos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="px-3.5 py-2 text-xs font-medium rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all flex items-center gap-1.5 shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Código Copiado!
                </span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Código (.py)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Barra de Componentes Clicáveis (Explorador Interativo) */}
      <div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
          Clique em um componente abaixo para inspecionar sua função no código:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {PYTHON_COMPONENTS.map((comp) => {
            const isSelected = comp.id === selectedComponentId;
            return (
              <button
                key={comp.id}
                onClick={() => handleSelectComponent(comp)}
                className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-500/70 shadow-sm ring-1 ring-blue-500/40'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className={`font-semibold text-xs truncate ${
                      isSelected
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {comp.name}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500 shrink-0">
                    L{comp.lineStart}-{comp.lineEnd}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {comp.badge}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Principal: Código Python Não-Editável (Esquerda) + Cartão Explicativo (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Visualizador de Código Não-Editável */}
        <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 shadow-md overflow-hidden flex flex-col h-[620px]">
          {/* Barra de título do editor */}
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-slate-300">engine/calculator.py</span>
            </div>
            <span className="text-[11px] text-slate-500">Apenas leitura (Não-editável)</span>
          </div>

          {/* Área de rolagem do código com números de linha */}
          <div
            ref={codeContainerRef}
            className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 scrollbar-thin select-text"
          >
            <pre className="table w-full">
              {codeLines.map((line, idx) => {
                const lineNum = idx + 1;
                const isHighlighted =
                  lineNum >= selectedComponent.lineStart && lineNum <= selectedComponent.lineEnd;

                return (
                  <div
                    key={idx}
                    data-line-number={lineNum}
                    className={`table-row transition-colors ${
                      isHighlighted
                        ? 'bg-blue-900/30 text-blue-100 font-medium'
                        : 'hover:bg-slate-900/40 text-slate-300'
                    }`}
                  >
                    {/* Número da Linha */}
                    <span className="table-cell select-none pr-4 text-right text-slate-600 font-mono text-[11px] w-10">
                      {lineNum}
                    </span>
                    {/* Conteúdo da Linha */}
                    <span className="table-cell whitespace-pre font-mono">
                      {line || ' '}
                    </span>
                  </div>
                );
              })}
            </pre>
          </div>
        </div>

        {/* Cartão Explicativo Interativo do Componente Selecionado */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between h-[620px] overflow-y-auto scrollbar-thin">
          <div>
            {/* Cabeçalho do Card */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                {selectedComponent.badge}
              </span>
              <span className="font-mono text-xs text-slate-400">
                Linhas {selectedComponent.lineStart} até {selectedComponent.lineEnd}
              </span>
            </div>

            {/* Título do Componente */}
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2">
              {selectedComponent.name}
            </h3>

            {/* Resumo */}
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              {selectedComponent.summary}
            </p>

            {/* Papel no Desacoplamento */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 mb-4">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-500" />
                <span>Por que é fundamental?</span>
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {selectedComponent.role}
              </p>
            </div>

            {/* Como Funciona Passo a Passo */}
            <div className="mb-4">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                Como funciona a lógica de programação:
              </span>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {selectedComponent.howItWorks.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trecho Chave Destacado */}
            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Trecho de código em destaque:
              </span>
              <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto border border-slate-800 leading-relaxed">
                <code>{selectedComponent.keyHighlight}</code>
              </pre>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Dica: clique em outro componente acima para inspecionar</span>
            <button
              onClick={() => {
                const currentIndex = PYTHON_COMPONENTS.findIndex(
                  (c) => c.id === selectedComponentId
                );
                const nextIndex = (currentIndex + 1) % PYTHON_COMPONENTS.length;
                handleSelectComponent(PYTHON_COMPONENTS[nextIndex]);
              }}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Próximo</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
