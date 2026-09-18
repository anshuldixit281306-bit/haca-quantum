import { ArrowRight } from "lucide-react";

const concepts = [
  { number: "01", title: "Qubits", copy: "See how probability amplitudes turn a classical bit into a quantum state." },
  { number: "02", title: "Superposition", copy: "Rotate a state and watch its |0⟩ and |1⟩ probabilities change in real time." },
  { number: "03", title: "Entanglement", copy: "Build Bell states and explore correlations that have no classical equivalent." },
];

function ConceptsSection({ activeConcept, onConceptChange }) {
  return (
    <section className="landing-section" id="concepts">
      <p className="landing-kicker">START WITH THE BUILDING BLOCKS</p>
      <div className="landing-section-heading"><h2>Quantum ideas, made visible.</h2><p>Skip the black box. Manipulate the state, observe the result, and build a mental model that lasts.</p></div>
      <div className="concept-grid">
        {concepts.map((concept, index) => (
          <article className={`concept-card ${activeConcept === index ? "is-active" : ""}`} key={concept.number} onMouseEnter={() => onConceptChange(index)}>
            <span>{concept.number}</span><h3>{concept.title}</h3><p>{concept.copy}</p><ArrowRight size={17} />
          </article>
        ))}
      </div>
    </section>
  );
}

export default ConceptsSection;