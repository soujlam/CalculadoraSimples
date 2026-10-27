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
    main()
