"""
QuantumLearn Local AI Tutor

A structured rule-based Quantum Computing tutor.
No paid external API is required.
"""

from typing import Any

from .knowledge import (
    find_topic,
    get_knowledge,
    get_available_topics,
)
from .analyzer import analyze_quantum_result


VALID_LEVELS = {
    "beginner",
    "intermediate",
    "advanced",
}


# ============================================================
# HELPERS
# ============================================================

def _normalize_level(level: str) -> str:
    """
    Normalize learning level.
    """

    if not level:
        return "beginner"

    level = level.lower().strip()

    if level not in VALID_LEVELS:
        return "beginner"

    return level


def _format_list(items):
    """
    Convert a list into Markdown bullet points.
    """

    if not items:
        return ""

    return "\n".join(
        f"- {item}"
        for item in items
    )


def _format_section(title: str, content: Any) -> str:
    """
    Format a Markdown section.
    """

    if content is None:
        return ""

    if isinstance(content, list):
        if not content:
            return ""

        return (
            f"## {title}\n\n"
            f"{_format_list(content)}\n"
        )

    return (
        f"## {title}\n\n"
        f"{content}\n"
    )


# ============================================================
# ANSWER GENERATOR
# ============================================================

def generate_answer(
    question: str,
    knowledge: dict,
    level: str = "beginner",
) -> str:
    """
    Generate a structured educational Markdown answer.
    """

    level = _normalize_level(level)

    title = knowledge.get(
        "title",
        "Quantum Computing"
    )

    answer = []

    # --------------------------------------------------------
    # TITLE
    # --------------------------------------------------------

    answer.append(f"# {title}")

    # --------------------------------------------------------
    # DEFINITION
    # --------------------------------------------------------

    answer.append(
        _format_section(
            "Definition",
            knowledge.get("definition")
        )
    )

    # --------------------------------------------------------
    # SIMPLE EXPLANATION
    # --------------------------------------------------------

    answer.append(
        _format_section(
            "In Simple Words",
            knowledge.get("simple_explanation")
        )
    )

    # --------------------------------------------------------
    # HOW IT WORKS
    # --------------------------------------------------------

    answer.append(
        _format_section(
            "How It Works",
            knowledge.get("how_it_works")
        )
    )

    # --------------------------------------------------------
    # KEY IDEAS
    # --------------------------------------------------------

    answer.append(
        _format_section(
            "Key Ideas",
            knowledge.get("key_ideas")
        )
    )

    # --------------------------------------------------------
    # BEGINNER
    # --------------------------------------------------------

    answer.append(
        _format_section(
            "Example",
            knowledge.get("example")
        )
    )

    # --------------------------------------------------------
    # INTERMEDIATE
    # --------------------------------------------------------

    if level in {
        "intermediate",
        "advanced",
    }:

        answer.append(
            _format_section(
                "Classical vs Quantum",
                knowledge.get("classical_comparison")
            )
        )

        answer.append(
            _format_section(
                "Mathematical View",
                knowledge.get("mathematical_explanation")
            )
        )

        answer.append(
            _format_section(
                "Applications",
                knowledge.get("applications")
            )
        )

        answer.append(
            _format_section(
                "Real-World Examples",
                knowledge.get("real_world_examples")
            )
        )

        answer.append(
            _format_section(
                "Advantages",
                knowledge.get("advantages")
            )
        )

        answer.append(
            _format_section(
                "Benefits",
                knowledge.get("benefits")
            )
        )

        answer.append(
            _format_section(
                "Disadvantages",
                knowledge.get("disadvantages")
            )
        )

        answer.append(
            _format_section(
                "Limitations",
                knowledge.get("limitations")
            )
        )

    # --------------------------------------------------------
    # ADVANCED
    # --------------------------------------------------------

    if level == "advanced":

        answer.append(
            _format_section(
                "Common Misconceptions",
                knowledge.get("common_misconceptions")
            )
        )

        answer.append(
            _format_section(
                "Related Topics",
                knowledge.get("related_topics")
            )
        )

        answer.append(
            _format_section(
                "Teacher's Note",
                (
                    "Focus on understanding the physical and mathematical "
                    "meaning of the concept rather than memorizing definitions."
                )
            )
        )

    # --------------------------------------------------------
    # NEXT TOPICS
    # --------------------------------------------------------

    related_topics = knowledge.get(
        "related_topics",
        []
    )

    if related_topics:

        answer.append(
            _format_section(
                "What You Can Learn Next",
                related_topics[:4]
            )
        )

    # Remove empty sections
    return "\n\n".join(
        section.strip()
        for section in answer
        if section and section.strip()
    )


# ============================================================
# QUANTUM TUTOR
# ============================================================

class QuantumTutor:

    def ask(
        self,
        question: str,
        level: str = "beginner",
    ) -> dict[str, Any]:
        """
        Answer a Quantum Computing question.
        """

        if not question or not question.strip():

            return {
                "success": False,
                "answer": "Please enter a Quantum Computing question.",
                "topic": None,
                "level": _normalize_level(level),
            }

        level = _normalize_level(level)

        question = question.strip()

        topic = find_topic(question)

        # ----------------------------------------------------
        # UNKNOWN TOPIC
        # ----------------------------------------------------

        if topic is None:

            topics = get_available_topics()

            topic_list = "\n".join(
                f"- {topic}"
                for topic in topics
            )

            answer = (
                "# QuantumLearn AI Tutor\n\n"
                "I can help you learn Quantum Computing, but I "
                "couldn't identify the topic in your question.\n\n"
                "## Topics I Currently Understand\n\n"
                f"{topic_list}\n\n"
                "Try asking something like:\n\n"
                "- What is a qubit?\n"
                "- Explain superposition.\n"
                "- How does the Hadamard gate work?\n"
                "- Explain Grover's algorithm."
            )

            return {
                "success": True,
                "answer": answer,
                "topic": None,
                "level": level,
            }

        # ----------------------------------------------------
        # GET KNOWLEDGE
        # ----------------------------------------------------

        knowledge = get_knowledge(topic)

        if knowledge is None:

            return {
                "success": False,
                "answer": (
                    "I couldn't find enough knowledge for this topic."
                ),
                "topic": topic,
                "level": level,
            }

        # ----------------------------------------------------
        # GENERATE ANSWER
        # ----------------------------------------------------

        answer = generate_answer(
            question=question,
            knowledge=knowledge,
            level=level,
        )

        return {
            "success": True,
            "answer": answer,
            "topic": topic,
            "level": level,
        }

    # ========================================================
    # RESULT EXPLANATION
    # ========================================================

    def explain_result(
        self,
        result: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Explain a quantum simulation result.
        """

        if not result:

            return {
                "success": False,
                "answer": "No quantum result was provided.",
            }

        analysis = analyze_quantum_result(result)

        return {
            "success": True,
            **analysis,
        }


# ============================================================
# SHARED TUTOR INSTANCE
# ============================================================

tutor = QuantumTutor()


__all__ = [
    "QuantumTutor",
    "tutor",
    "generate_answer",
]