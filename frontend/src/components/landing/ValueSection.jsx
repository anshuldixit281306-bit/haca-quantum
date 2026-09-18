import { BookOpen, Telescope, Trophy } from "lucide-react";

const cards = [[BookOpen, "Learn", "Understand quantum concepts step-by-step."], [Telescope, "Explore", "Visualize and explore quantum algorithms."], [Trophy, "Master", "Practice, complete challenges and track progress."]];

export default function ValueSection() {
  return <section className="ql-new-section ql-new-value"><div className="ql-new-section-inner"><div className="ql-new-heading ql-new-reveal"><h2>Quantum Computing Doesn't <span>Have to Be Complicated.</span></h2><p>QuantumLearn breaks difficult quantum concepts into simple, interactive and engaging learning experiences that anyone can follow.</p></div><div className="ql-new-card-grid">{cards.map(([Icon, title, description], index) => <article className={`ql-new-card ql-new-reveal ql-new-delay-${index + 1}`} key={title}><div className="ql-new-icon"><Icon /></div><h3>{title}</h3><p>{description}</p></article>)}</div></div></section>;
}