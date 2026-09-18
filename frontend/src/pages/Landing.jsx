import { useEffect } from "react";
import { useReveal } from "../hooks/useReveal";
import QuantumBackground from "../components/landing/QuantumBackground";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import ValueSection from "../components/landing/ValueSection";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import Algorithms from "../components/landing/Algorithms";
import AITutor from "../components/landing/AITutor";
import Gamification from "../components/landing/Gamification";
import ProgressReport from "../components/landing/ProgressReport";
import WhyQuantumLearn from "../components/landing/WhyQuantumLearn";
import ReviewsMarquee from "../components/landing/ReviewsMarquee";
import FinalCTA from "../components/landing/FinalCTA";
import Footer from "../components/landing/Footer";
import "./NewLanding.css";

function Landing() {
  useReveal();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <main className="ql-new-page">
      <QuantumBackground />
      <div>
        <Navbar />
        <Hero />
        <ValueSection />
        <Features />
        <HowItWorks />
        <Algorithms />
        <AITutor />
        <Gamification />
        <ProgressReport />
        <WhyQuantumLearn />
        <ReviewsMarquee />
        <FinalCTA />
        <Footer />
      </div>
    </main>
  );
}

export default Landing;

