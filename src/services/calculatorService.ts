/**
 * Serviço de comunicação com o motor de cálculo Python.
 * Suporta modo duplo:
 * 1. Backend Express + Python 3.10 (quando executando com servidor full-stack)
 * 2. Pyodide WebAssembly Python (quando hospedado estaticamente no GitHub Pages)
 * Em ambos os casos, a lógica de cálculo permanece 100% em Python, isolada do frontend!
 */

declare global {
  interface Window {
    loadPyodide?: any;
    pyodideInstance?: any;
  }
}

export type EngineType = 'server' | 'wasm';

// Código do motor em Python (idêntico ao engine/calculator.py)
const PYTHON_CALCULATOR_CODE = `
import ast
import operator
import json
import re

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
    expr = raw_expr.strip()
    expr = expr.replace('×', '*').replace('x', '*').replace('X', '*')
    expr = expr.replace('÷', '/')
    expr = expr.replace(',', '.')
    # Converte acréscimo ou desconto percentual: ex: "200 + 10%" -> "200 + (200 * 10 / 100)"
    expr = re.sub(r'(\d+(?:\.\d+)?)\s*([+\-])\s*(\d+(?:\.\d+)?)\s*%', r'\1 \2 (\1 * \3 / 100)', expr)
    # Converte porcentagem direta em qualquer outro contexto: ex: "50%" -> "(50 / 100)"
    expr = re.sub(r'(\d+(?:\.\d+)?)\s*%', r'(\1 / 100)', expr)
    return expr

def eval_node(node):
    if isinstance(node, ast.Expression):
        return eval_node(node.body)
    if isinstance(node, ast.Constant):
        if isinstance(node.value, (int, float)):
            return node.value
        raise ValueError(f"Tipo não suportado: {type(node.value).__name__}")
    if isinstance(node, ast.BinOp):
        left = eval_node(node.left)
        right = eval_node(node.right)
        op_type = type(node.op)
        if op_type not in OPERATORS:
            raise ValueError(f"Operador não suportado: {op_type.__name__}")
        if op_type == ast.Div and right == 0:
            raise ZeroDivisionError("Divisão por zero não é permitida")
        return OPERATORS[op_type](left, right)
    if isinstance(node, ast.UnaryOp):
        operand = eval_node(node.operand)
        op_type = type(node.op)
        if op_type not in OPERATORS:
            raise ValueError(f"Operador unário não suportado: {op_type.__name__}")
        return OPERATORS[op_type](operand)
    raise ValueError(f"Expressão inválida")

def format_number(val: float | int) -> str:
    if isinstance(val, int):
        return str(val)
    rounded = round(val, 10)
    if rounded == int(rounded):
        return str(int(rounded))
    return f"{rounded:.10f}".rstrip('0').rstrip('.')

def calculate_percentage(value, base=None, operator_symbol=None):
    try:
        val = float(value)
        if base is not None and operator_symbol:
            b = float(base)
            op = str(operator_symbol).strip()
            if op in ('+', '-'):
                percent_val = (b * val) / 100.0
            else:
                percent_val = val / 100.0
        else:
            percent_val = val / 100.0

        formatted = format_number(percent_val)
        num_result = int(formatted) if '.' not in formatted else float(formatted)
        return {
            "success": True,
            "result": num_result,
            "formattedResult": formatted,
            "percentage": val,
            "base": base,
            "operator": operator_symbol
        }
    except Exception as e:
        return {"success": False, "error": f"Erro ao calcular porcentagem: {str(e)}"}

def py_percentage(val, base=None, op=None):
    return json.dumps(calculate_percentage(val, base, op))

def py_calculate(expr_str: str) -> str:
    try:
        cleaned = clean_expression(expr_str)
        tree = ast.parse(cleaned, mode='eval')
        raw = eval_node(tree)
        formatted = format_number(raw)
        num_res = int(formatted) if '.' not in formatted else float(formatted)
        return json.dumps({
            "success": True,
            "expression": expr_str,
            "result": num_res,
            "formattedResult": formatted
        })
    except ZeroDivisionError:
        return json.dumps({
            "success": False,
            "error": "Divisão por zero não é permitida"
        })
    except Exception as e:
        return json.dumps({
            "success": False,
            "error": f"Erro de sintaxe na expressão"
        })
`;

let pyodidePromise: Promise<any> | null = null;
const isGithubPages = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');
let activeEngineType: EngineType = isGithubPages ? 'wasm' : 'server';

async function initPyodide(): Promise<any> {
  if (window.pyodideInstance) {
    return window.pyodideInstance;
  }

  if (!pyodidePromise) {
    pyodidePromise = new Promise((resolve, reject) => {
      // Injeta o script do Pyodide CDN
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
      script.async = true;
      script.onload = async () => {
        try {
          const pyodide = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
          });
          await pyodide.runPythonAsync(PYTHON_CALCULATOR_CODE);
          window.pyodideInstance = pyodide;
          resolve(pyodide);
        } catch (err) {
          reject(err);
        }
      };
      script.onerror = () => reject(new Error('Falha ao carregar o interpretador Python WebAssembly'));
      document.head.appendChild(script);
    });
  }

  return pyodidePromise;
}

// Se estiver no GitHub Pages, pré-carrega o Pyodide em segundo plano
if (isGithubPages) {
  setTimeout(() => {
    initPyodide().catch(() => {});
  }, 100);
}

export async function calculateWithPython(payload: {
  operand1?: number;
  operator?: string | null;
  operand2?: number;
  expression?: string;
  action?: string;
  value?: number;
  base?: number;
  percentage?: number;
}): Promise<{
  success: boolean;
  result?: number;
  formattedResult?: string;
  expression?: string;
  error?: string;
  engine: EngineType;
  historyRecord?: any;
}> {
  let expr = payload.expression;
  if (!expr && payload.operand1 !== undefined && payload.operator && payload.operand2 !== undefined) {
    const op1 = payload.operand1;
    const op2 = payload.operand2;
    expr = `${op1} ${payload.operator} ${op2}`;
  }

  const isPercentageAction = payload.action === 'percentage' || payload.percentage !== undefined;

  if (!expr && !isPercentageAction) {
    return { success: false, error: 'Expressão inválida', engine: activeEngineType };
  }

  // Tenta primeiro o servidor backend (apenas se não estiver no GitHub Pages estático)
  if (activeEngineType === 'server') {
    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        return { ...data, engine: 'server' };
      }

      // Se qualquer erro ocorrer (como 404 ou 405 Method Not Allowed), migra para Pyodide
      activeEngineType = 'wasm';
    } catch {
      activeEngineType = 'wasm';
    }
  }

  // Modo Python WebAssembly (GitHub Pages)
  try {
    const pyodide = await initPyodide();
    let rawResultJson: string;

    if (isPercentageAction) {
      const val = payload.percentage ?? payload.value ?? 0;
      const baseArg = payload.base !== undefined ? payload.base : 'None';
      const opArg = payload.operator ? `'${payload.operator}'` : 'None';
      rawResultJson = await pyodide.runPythonAsync(`py_percentage(${val}, ${baseArg}, ${opArg})`);
    } else {
      const cleanExprArg = (expr || '').replace(/'/g, "\\'");
      rawResultJson = await pyodide.runPythonAsync(`py_calculate('${cleanExprArg}')`);
    }

    const parsed = JSON.parse(rawResultJson);
    return { ...parsed, engine: 'wasm' };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Erro ao executar cálculo em Python.',
      engine: 'wasm',
    };
  }
}

export function getActiveEngineType(): EngineType {
  return activeEngineType;
}
