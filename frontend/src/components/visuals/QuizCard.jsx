/**
 * <QuizCard /> — quick prediction question shown for the active segment.
 *
 * Props:
 *   question   — { prompt, options[], answer_index, explanation }
 *   concept    — current concept key (resets the card per concept)
 *   onAnswered — (isCorrect) => callback for gamification
 */

import { useEffect, useState } from "react";
import "./visualStyles.css";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export default function QuizCard({ question, concept, onAnswered }) {
  const [selected, setSelected] = useState(null);

  // New concept → fresh question
  useEffect(() => {
    setSelected(null);
  }, [concept]);

  if (!question?.prompt || !Array.isArray(question.options)) return null;

  const answered = selected != null;
  const isCorrect = selected === question.answer_index;

  return (
    <div className="ql-panel">
      <p className="ql-panel-title">
        <span className="dot" />
        Quick Practice — {concept}
      </p>

      <p style={{ margin: "0 0 4px", fontSize: 13.5, color: "var(--q-ink, #e9f6ff)" }}>
        {question.prompt}
      </p>

      <div className="ql-quiz-options">
        {question.options.map((option, index) => {
          let cls = "ql-quiz-option";

          if (answered) {
            if (index === question.answer_index) cls += " correct";
            else if (index === selected) cls += " incorrect";
          }

          return (
            <button
              type="button"
              key={`${concept}-${index}`}
              className={cls}
              disabled={answered}
              onClick={() => {
                setSelected(index);
                onAnswered?.(index === question.answer_index);
              }}
            >
              <span className="ql-quiz-letter">{LETTERS[index] || "?"}</span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      {answered ? (
        <div className="ql-quiz-explain">
          <b style={{ color: isCorrect ? "#8ef0c0" : "#ffc9ce" }}>
            {isCorrect ? "Correct! " : "Not quite — "}
          </b>
          {question.explanation || ""}
        </div>
      ) : null}
    </div>
  );
}
