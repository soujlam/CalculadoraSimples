#!/usr/bin/env python3
"""
Módulo de Cálculo da Calculadora Web
Toda a lógica matemática e validação aritmética é executada aqui, de forma
completamente isolada do frontend.
"""

import sys
import json
import ast
import operator
import re
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
    """Normaliza símbolos de operadores comuns e converte porcentagens para notação aritmética válida."""
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

def calculate_percentage(value: float, base: float | None = None, operator_symbol: str | None = None) -> dict:
    """
    Calcula a porcentagem tanto de forma simples (ex: 50% = 0.5) 
    quanto contextual associada a um operador (ex: 200 + 10% -> 20).
    """
    try:
        val = float(value)
        if base is not None and operator_symbol:
            b = float(base)
            op = operator_symbol.strip()
            if op in ('+', '-'):
                # Em adições e subtrações comerciais, X% de Base é (Base * X) / 100
                percent_val = (b * val) / 100.0
            else:
                # Em multiplicações e divisões, X% é X / 100
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
        return {
            "success": False,
            "error": f"Erro ao calcular porcentagem: {str(e)}"
        }

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
            if data.get("action") == "percentage" or "percentage" in data:
                val = data.get("percentage") if "percentage" in data else data.get("value", 0)
                base = data.get("base")
                op = data.get("operator")
                res = calculate_percentage(
                    float(val),
                    float(base) if base is not None else None,
                    str(op) if op else None
                )
            elif "operand1" in data and "operator" in data and "operand2" in data:
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
    main()
