
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

import "./AITutor.css";
import { API_BASE_URL } from "../services/api";
const API_URL = API_BASE_URL;

function AITutor() {
  const [message, setMessage] = useState("");
  const [level, setLevel] = useState("beginner");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([]);

  const messagesEndRef = useRef(null);

  // ========================================================
  // AUTO SCROLL
  // ========================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // ========================================================
  // SEND MESSAGE
  // ========================================================

  const sendMessage = async (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: trimmedMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/ai/ask`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          question: trimmedMessage,
          level: level,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Unable to get a response from AI Tutor.";

        try {
          const errorData = await response.json();

          if (errorData?.detail) {
            errorMessage = errorData.detail;
          }
        } catch {
          // Keep default error message
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      const tutorAnswer =
        data?.answer ||
        "I couldn't generate an answer. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: tutorAnswer,
        },
      ]);
    } catch (error) {
      console.error("AI Tutor error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            "I'm unable to connect to the QuantumLearn AI service right now. Please make sure the backend is running and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================
  // UI
  // ========================================================

  return (
    <div className="ai-tutor-page">
      {/* Main */}

      <main className="ai-tutor-main">

        {/* Title */}

        <section className="ai-tutor-title">

          <div className="ai-tutor-title-icon">
            <Sparkles size={20} />
          </div>

          <p>QUANTUM LEARNING ASSISTANT</p>

          <h1>AI Tutor</h1>

          <span>
            Your personal guide to understanding quantum computing
            step by step.
          </span>

        </section>


        {/* Chat */}

        <section className="chat-container">

          {/* Chat Messages */}

          <div
            className={`chat-messages ${
              messages.length === 0 ? "empty-chat" : ""
            }`}
          >

            {/* Empty State */}

            {messages.length === 0 && !loading && (
              <div className="ai-empty-state">

                <div className="ai-empty-icon">
                  <Sparkles size={28} />
                </div>

                <h2>How can I help you?</h2>

                <p>
                  Ask me anything about quantum computing,
                  from basic concepts to advanced algorithms.
                </p>

                <div className="ai-topic-hints">
                  <span>Qubits</span>
                  <span>Superposition</span>
                  <span>Quantum Gates</span>
                  <span>Entanglement</span>
                </div>

              </div>
            )}


            {/* Messages */}

            {messages.map((item, index) => (
              <div
                key={index}
                className={`chat-message ${
                  item.role === "user"
                    ? "user-message"
                    : "assistant-message"
                }`}
              >

                <div className="message-content">

                  <span className="message-role">
                    {item.role === "user"
                      ? "You"
                      : "AI Tutor"}
                  </span>

                  <div className="message-text">
                    <ReactMarkdown>
                      {item.text}
                    </ReactMarkdown>
                  </div>

                </div>

              </div>
            ))}


            {/* Loading */}

            {loading && (
              <div className="chat-message assistant-message">

                <div className="message-content">

                  <span className="message-role">
                    AI Tutor
                  </span>

                  <div className="message-text ai-thinking">

                    <span className="thinking-dot" />
                    <span className="thinking-dot" />
                    <span className="thinking-dot" />

                    <span className="thinking-text">
                      Thinking...
                    </span>

                  </div>

                </div>

              </div>
            )}

            <div ref={messagesEndRef} />

          </div>


          {/* Level Selector */}

          <div className="ai-level-selector">

            <div className="level-label">
              <span className="level-label-title">
                Learning Level
              </span>

              <span className="level-label-subtitle">
                Choose how detailed your explanations should be
              </span>
            </div>

            <div className="level-options">

              <button
                type="button"
                className={
                  level === "beginner"
                    ? "level-option active"
                    : "level-option"
                }
                onClick={() => setLevel("beginner")}
                disabled={loading}
              >
                <span className="level-dot" />
                Beginner
              </button>

              <button
                type="button"
                className={
                  level === "intermediate"
                    ? "level-option active"
                    : "level-option"
                }
                onClick={() => setLevel("intermediate")}
                disabled={loading}
              >
                <span className="level-dot" />
                Intermediate
              </button>

              <button
                type="button"
                className={
                  level === "advanced"
                    ? "level-option active"
                    : "level-option"
                }
                onClick={() => setLevel("advanced")}
                disabled={loading}
              >
                <span className="level-dot" />
                Advanced
              </button>

            </div>

          </div>


          {/* Input */}

          <form
            className="chat-input-area"
            onSubmit={sendMessage}
          >

            <input
              type="text"
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              placeholder="Ask anything about quantum computing..."
              disabled={loading}
            />

            <button
              type="submit"
              aria-label="Send message"
              disabled={
                !message.trim() || loading
              }
            >
              <Send size={18} />
            </button>

          </form>


          <p className="chat-note">
            AI Tutor adapts explanations to your selected learning level.
          </p>

        </section>

      </main>

    </div>
  );
}

export default AITutor;

