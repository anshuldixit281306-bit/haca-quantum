"""
Safe Python and Qiskit code execution engine for QuantumLearn Code Lab and Coding Challenges.
Enforces strict AST validation, forbids dangerous system calls, and runs with timeout.
"""

import ast
import builtins
import contextlib
import io
import math
import sys
import threading
from typing import Any

from qiskit import QuantumCircuit
from app.services.simulation_backends import get_backend


FORBIDDEN_MODULES = {
    "os",
    "sys",
    "subprocess",
    "shutil",
    "socket",
    "urllib",
    "requests",
    "http",
    "pathlib",
    "importlib",
    "ctypes",
    "builtins",
    "multiprocessing",
    "signal",
    "pty",
    "platform",
    "asyncio",
}

FORBIDDEN_CALLS = {
    "eval",
    "exec",
    "open",
    "__import__",
    "compile",
    "globals",
    "locals",
    "getattr",
    "setattr",
    "delattr",
}

ALLOWED_IMPORT_ROOTS = {"qiskit", "qiskit_aer", "numpy", "math"}


def _safe_import(name, globals=None, locals=None, fromlist=(), level=0):
    """Allow user code to import approved quantum/scientific modules only."""
    root_module = name.split(".", 1)[0]
    if level != 0 or root_module not in ALLOWED_IMPORT_ROOTS:
        raise ImportError(f"Import of '{name}' is not allowed.")

    return builtins.__import__(
        name,
        globals,
        locals,
        fromlist,
        level,
    )


class CodeSecurityValidator(ast.NodeVisitor):
    """AST validator to reject unsafe code before execution."""

    def __init__(self):
        self.errors = []

    def visit_Import(self, node: ast.Import):
        for alias in node.names:
            base_module = alias.name.split(".")[0]
            if base_module in FORBIDDEN_MODULES:
                self.errors.append(f"Import of forbidden module '{base_module}' is not allowed.")
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom):
        if node.module:
            base_module = node.module.split(".")[0]
            if base_module in FORBIDDEN_MODULES:
                self.errors.append(f"Import from forbidden module '{base_module}' is not allowed.")
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call):
        if isinstance(node.func, ast.Name):
            if node.func.id in FORBIDDEN_CALLS:
                self.errors.append(f"Call to restricted function '{node.func.id}()' is prohibited.")
        self.generic_visit(node)


def validate_python_code(code: str) -> list[str]:
    """Parse and validate Python code using AST."""
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return [f"Syntax Error on line {e.lineno}: {e.msg}"]

    validator = CodeSecurityValidator()
    validator.visit(tree)
    return validator.errors


def execute_quantum_code(
    code: str,
    shots: int = 1024,
    timeout_seconds: float = 8.0,
) -> dict[str, Any]:
    """
    Safely execute user Python code, discover the QuantumCircuit,
    run simulation, and capture output.
    """

    validation_errors = validate_python_code(code)
    if validation_errors:
        return {
            "success": False,
            "error": "Security validation failed: " + "; ".join(validation_errors),
            "stdout": "",
            "stderr": "",
            "return_code": 1,
            "circuit_diagram": None,
            "counts": {},
            "probabilities": {},
        }

    # Prepare restricted execution environment
    safe_globals = {
        "__builtins__": {
            "__import__": _safe_import,
            "print": print,
            "range": range,
            "len": len,
            "int": int,
            "float": float,
            "str": str,
            "bool": bool,
            "list": list,
            "dict": dict,
            "set": set,
            "tuple": tuple,
            "min": min,
            "max": max,
            "sum": sum,
            "abs": abs,
            "round": round,
            "enumerate": enumerate,
            "zip": zip,
            "math": math,
        },
        "math": math,
    }

    try:
        import numpy as np
        safe_globals["np"] = np
        safe_globals["numpy"] = np
    except ImportError:
        pass

    try:
        import qiskit
        safe_globals["qiskit"] = qiskit
        safe_globals["QuantumCircuit"] = QuantumCircuit
    except ImportError:
        pass

    local_scope: dict[str, Any] = {}
    stdout_capture = io.StringIO()
    stderr_capture = io.StringIO()
    exception_container: list[Exception] = []

    def target():
        with contextlib.redirect_stdout(stdout_capture), contextlib.redirect_stderr(stderr_capture):
            try:
                exec(code, safe_globals, local_scope)
            except Exception as e:
                exception_container.append(e)

    worker = threading.Thread(target=target)
    worker.start()
    worker.join(timeout=timeout_seconds)

    if worker.is_alive():
        return {
            "success": False,
            "error": f"Execution timed out after {timeout_seconds} seconds.",
            "stdout": stdout_capture.getvalue(),
            "stderr": stderr_capture.getvalue(),
            "return_code": 124,
            "circuit_diagram": None,
            "counts": {},
            "probabilities": {},
        }

    stdout_text = stdout_capture.getvalue()
    stderr_text = stderr_capture.getvalue()

    if exception_container:
        exc = exception_container[0]
        return {
            "success": False,
            "error": f"Runtime {type(exc).__name__}: {exc}",
            "stdout": stdout_text,
            "stderr": stderr_text,
            "return_code": 1,
            "circuit_diagram": None,
            "counts": {},
            "probabilities": {},
        }

    # Discover QuantumCircuit instance in local variables
    discovered_circuit: QuantumCircuit | None = None
    for val in local_scope.values():
        if isinstance(val, QuantumCircuit):
            discovered_circuit = val
            break

    if discovered_circuit is None:
        return {
            "success": True,
            "message": "Code executed successfully (no QuantumCircuit variable found).",
            "stdout": stdout_text,
            "stderr": stderr_text,
            "return_code": 0,
            "circuit_diagram": None,
            "counts": {},
            "probabilities": {},
        }

    # Simulate discovered circuit
    try:
        backend = get_backend("qiskit_aer")
        sim_result = backend.run_circuit(discovered_circuit, shots=shots)
        sim_result["stdout"] = stdout_text
        sim_result["stderr"] = stderr_text
        sim_result["return_code"] = 0
        return sim_result
    except Exception as e:
        return {
            "success": False,
            "error": f"Circuit simulation error: {e}",
            "stdout": stdout_text,
            "stderr": stderr_text,
            "return_code": 1,
            "circuit_diagram": discovered_circuit.draw(output="text").__str__(),
            "counts": {},
            "probabilities": {},
        }
