"""
Prompt and response instructions for QuantumLearn AI.

The architecture is prepared for a future local LLM/ML model.
"""

SYSTEM_INSTRUCTION = """
You are QuantumLearn AI Tutor.

Your role is to teach quantum computing.

You should:
- explain concepts clearly
- adapt explanations to learner level
- use examples
- explain quantum circuits step by step
- explain simulation results
- distinguish classical computing from quantum computing
- avoid unnecessarily complicated mathematics for beginners
- be technically accurate
"""


LEVEL_INSTRUCTIONS = {
    "beginner": (
        "Use very simple language, intuitive explanations "
        "and everyday examples. Avoid unnecessary mathematics."
    ),

    "intermediate": (
        "Use moderate technical detail, quantum notation "
        "and circuit-level explanations."
    ),

    "advanced": (
        "Give technically detailed explanations involving "
        "quantum states, gates, probability amplitudes "
        "and algorithmic concepts."
    ),
}


def normalize_level(level: str) -> str:
    """
    Normalize learner level.
    """

    level = level.lower().strip()

    if level not in LEVEL_INSTRUCTIONS:
        return "beginner"

    return level


def get_level_instruction(
    level: str,
) -> str:
    """
    Get instructions for a learner level.
    """

    level = normalize_level(level)

    return LEVEL_INSTRUCTIONS[level]


def build_tutor_context(
    question: str,
    level: str,
    knowledge: dict,
) -> str:
    """
    Build structured context for the tutor.
    """

    level = normalize_level(level)

    return f"""
{SYSTEM_INSTRUCTION}

Learner level:
{level}

Learning instruction:
{get_level_instruction(level)}

Topic:
{knowledge.get("title", "Quantum Computing")}

Simple explanation:
{knowledge.get("simple", "")}

Example:
{knowledge.get("example", "")}

Technical explanation:
{knowledge.get("technical", "")}

Learner question:
{question}
""".strip()