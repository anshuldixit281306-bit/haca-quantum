import { ArrowRight, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const links = [["Home", "#home"], ["Features", "#features"], ["How It Works", "#how-it-works"], ["Algorithms", "#algorithms"], ["About", "#about"]];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const go = (href) => { setOpen(false); document.querySelector(href)?.scrollIntoView({ behavior: "smooth" }); };
  return <nav className={`ql-new-nav ${scrolled ? "is-scrolled" : ""}`}>
    <button type="button" className="ql-new-brand" onClick={() => go("#home")}><span>⚛</span><strong>QuantumLearn</strong></button>
    <div className="ql-new-nav-links">{links.map(([label, href]) => <button type="button" key={label} onClick={() => go(href)}>{label}</button>)}</div>
    <Link className="ql-new-button ql-new-button-small ql-new-desktop-cta" to="/signup">Get Started <ArrowRight size={15} /></Link>
    <button type="button" className="ql-new-menu" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
    {open && <div className="ql-new-mobile-menu">{links.map(([label, href]) => <button type="button" key={label} onClick={() => go(href)}>{label}</button>)}<Link className="ql-new-button" to="/signup" onClick={() => setOpen(false)}>Get Started <ArrowRight size={15} /></Link></div>}
  </nav>;
}

export default Navbar;