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
let activeEngineType: EngineType = 'server';

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

export async function calculateWithPython(payload: {
  operand1?: number;
  operator?: string | null;
  operand2?: number;
  expression?: string;
}): Promise<{
  success: boolean;
  result?: number;
  formattedResult?: string;
  expression?: string;
  error?: string;
  engine: EngineType;
}> {
  let expr = payload.expression;
  if (!expr && payload.operand1 !== undefined && payload.operator && payload.operand2 !== undefined) {
    const op1 = payload.operand1;
    const op2 = payload.operand2;
    expr = `${op1} ${payload.operator} ${op2}`;
  }

  if (!expr) {
    return { success: false, error: 'Expressão inválida', engine: activeEngineType };
  }

  // Tenta primeiro o servidor backend (se estiver ativo)
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

      // Se retornou 404 (ex: no GitHub Pages onde não há servidor), muda para Pyodide
      if (res.status === 404 || res.status === 502) {
        console.info('Servidor API não encontrado (ambiente estático). Ativando Python WebAssembly (Pyodide)...');
        activeEngineType = 'wasm';
      }
    } catch {
      console.info('Falha ao conectar no servidor. Ativando Python WebAssembly (Pyodide)...');
      activeEngineType = 'wasm';
    }
  }

  // Modo Python WebAssembly (GitHub Pages)
  try {
    const pyodide = await initPyodide();
    const cleanExprArg = expr.replace(/'/g, "\\'");
    const rawResultJson = await pyodide.runPythonAsync(`py_calculate('${cleanExprArg}')`);
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
