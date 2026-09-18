import { BookOpen, LineChart, PenTool, Target } from "lucide-react";

const steps = [[BookOpen, "Learn", "Understand the fundamentals."], [PenTool, "Practice", "Test your knowledge with interactive activities."], [Target, "Challenge", "Complete quizzes and gamified challenges."], [LineChart, "Track", "Monitor your progress and achievements."]];

export default function HowItWorks() {
  return <section id="how-it-works" className="ql-new-section ql-new-how"><div className="ql-new-section-inner"><div className="ql-new-heading ql-new-reveal"><small>HOW IT WORKS</small><h2>Learn. Practice. Challenge. <span>Master.</span></h2></div><div className="ql-new-steps">{steps.map(([Icon, title, description], index) => <article className={`ql-new-step ql-new-reveal ${index % 2 ? "is-reverse" : ""}`} key={title}><div className="ql-new-step-number">0{index + 1}</div><div className="ql-new-icon"><Icon /></div><div><h3>{title}</h3><p>{description}</p></div></article>)}</div></div></section>;
}