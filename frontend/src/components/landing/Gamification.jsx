import { Award, Flame, Gamepad2, Star, Target, Trophy, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCountUp } from "../../hooks/useCountUp";

export default function Gamification() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => { const observer = new IntersectionObserver(([entry]) => { if (entry?.isIntersecting) { setVisible(true); observer.disconnect(); } }, { threshold: 0.2 }); if (ref.current) observer.observe(ref.current); return () => observer.disconnect(); }, []);
  const xp = useCountUp(1240, 1800, visible);
  const badges = useCountUp(12, 1400, visible);
  const challenges = useCountUp(24, 1800, visible);
  const stats = [[Zap, "XP", xp.toLocaleString(), "#5eead4"], [Trophy, "Level", "08", "#5eead4"], [Flame, "Day Streak", "7 🔥", "#f97316"], [Award, "Badges", badges, "#34d399"], [Target, "Challenges", challenges, "#34d399"]];
  return <section ref={ref} className="ql-new-section ql-new-gamification"><div className="ql-new-section-inner"><div className="ql-new-heading ql-new-reveal"><div className="ql-new-eyebrow"><Gamepad2 size={14} /> GAMIFICATION</div><h2>Turn Learning Into a <span>Game</span></h2><p>Learn more. Challenge yourself. Earn rewards.</p></div><div className="ql-new-gamification-layout"><div className="ql-new-stat-grid">{stats.map(([Icon, label, value, color]) => <article className="ql-new-card ql-new-stat" key={label}><div className="ql-new-stat-label"><Icon style={{ color }} /><small>{label}</small></div><strong>{value}</strong></article>)}<article className="ql-new-card ql-new-xp"><div><strong>Level 08 Progress</strong><span>740 / 1000 XP</span></div><i><b style={{ width: visible ? "74%" : "0%" }} /></i><small>260 XP to Level 09</small></article></div><article className="ql-new-card ql-new-badges"><h3><Award size={16} /> Achievement Badges</h3><div>{[Star, Zap, Flame, Trophy, Target, Award].map((Icon, index) => <span className={index === 5 ? "locked" : ""} key={index}><Icon /><small>{["First Steps", "Quick Learner", "Week Warrior", "Algorithm Ace", "Sharp Shooter", "Quantum Master"][index]}</small></span>)}</div></article></div></div></section>;
}