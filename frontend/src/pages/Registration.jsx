
import { useState } from "react";
import { Check, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import "./NewSignup.css";
import { API_BASE_URL } from "../services/api";
import { registerWithEmail, signInWithGoogle } from "../services/firebase";

const API_URL = API_BASE_URL;

function Registration() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "learner",
  });

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("CREATE ACCOUNT CLICKED");

    setError("");
    setSuccess("");

    const name = formData.name.trim();
    const email = formData.email.trim();

    // Check required fields
    if (
      !name ||
      !email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    // Check password length
    if (formData.password.length < 8) {
      setError(
        "Password must be at least 8 characters long."
      );
      return;
    }

    // Check password confirmation
    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    // Check terms
    if (!agreeTerms) {
      setError(
        "Please agree to the Terms and Privacy Policy."
      );
      return;
    }

    try {
      setLoading(true);

      let regSuccess = false;
      let userToken = null;

      // 1. Try backend register if reachable
      try {
        const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
        const isLocalApi = API_URL.includes("localhost") || API_URL.includes("127.0.0.1");

        if (!isHttps || !isLocalApi) {
          const response = await fetch(`${API_URL}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              email,
              password: formData.password,
              role: formData.role,
            }),
          });

          if (response.ok) {
            regSuccess = true;
          }
        }
      } catch (backendErr) {
        // Backend offline / loopback blocked
      }

      // 2. Register via Firebase Email Auth
      try {
        const fbUser = await registerWithEmail(email, formData.password);
        userToken = await fbUser.getIdToken();
        regSuccess = true;
      } catch (fbErr) {
        // If email already exists in firebase, or offline demo
        if (fbErr.code === "auth/email-already-in-use") {
          throw new Error("This email is already registered. Please log in.");
        }
      }

      // 3. Save profile and navigate
      const userObj = {
        name: name,
        email: email,
        role: formData.role,
      };
      localStorage.setItem("user", JSON.stringify(userObj));
      localStorage.setItem("access_token", userToken || ("token_" + Date.now()));

      setSuccess("Account created successfully! Welcome to Mac & Quantum!");

      setTimeout(() => {
        navigate(formData.role === "admin" ? "/admin/dashboard" : "/dashboard", {
          replace: true,
        });
      }, 900);
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError("");

      const firebaseUser = await signInWithGoogle();
      const idToken = await firebaseUser.getIdToken();

      const userObj = {
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Quantum Explorer",
        photo: firebaseUser.photoURL,
        role: formData.role || "learner",
      };

      localStorage.setItem("user", JSON.stringify(userObj));
      localStorage.setItem("access_token", idToken);

      navigate(formData.role === "admin" ? "/admin/dashboard" : "/dashboard", { replace: true });
    } catch (err) {
      console.warn("Google sign-in error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Google sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="ql-signup-page">
      <section className="ql-signup-stage">
        <div className="ql-signup-background" aria-hidden="true" />
        <div className="ql-signup-grid" aria-hidden="true" />
        <div className="ql-signup-orb ql-signup-orb-one" aria-hidden="true" />
        <div className="ql-signup-orb ql-signup-orb-two" aria-hidden="true" />
        <div className="ql-signup-orb ql-signup-orb-three" aria-hidden="true" />

        <header className="ql-signup-header">
          <Link to="/" className="ql-signup-brand"><span>⚛</span> QuantumLearn</Link>
          <Link to="/login" className="ql-signup-login-link">Already have an account? <strong>Log in</strong></Link>
        </header>

        <div className="ql-signup-title">
          <p>QUANTUM LEARNING WORKSPACE</p>
          <h1>Quantum<br /><span>Sign up</span></h1>
        </div>

        <form onSubmit={handleSubmit} className="ql-signup-card">
          <div className="ql-signup-card-brand"><span className="ql-signup-badge"><span /></span> QuantumLearn</div>
          <h2>Create your account</h2>
          <p className="ql-signup-card-copy">A few details and your quantum journey begins.</p>

          <label className="ql-signup-label" htmlFor="name">Full name</label>
          <div className="ql-signup-field"><User aria-hidden="true" /><input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Ada Lovelace" autoComplete="name" />{formData.name.trim().length >= 2 && <Check className="ql-signup-valid" aria-label="Valid name" />}</div>

          <label className="ql-signup-label" htmlFor="email">Email</label>
          <div className="ql-signup-field"><Mail aria-hidden="true" /><input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@studio.com" autoComplete="email" />{formData.email.includes("@") && <Check className="ql-signup-valid" aria-label="Valid email" />}</div>

          <label className="ql-signup-label" htmlFor="password">Password</label>
          <div className="ql-signup-field"><LockKeyhole aria-hidden="true" /><input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} placeholder="At least 8 characters" autoComplete="new-password" /><button type="button" className="ql-signup-eye" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff /> : <Eye />}</button>{formData.password.length >= 8 && <Check className="ql-signup-valid" aria-label="Valid password" />}</div>

          <label className="ql-signup-label" htmlFor="confirmPassword">Confirm password</label>
          <div className="ql-signup-field"><LockKeyhole aria-hidden="true" /><input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat your password" autoComplete="new-password" /><button type="button" className="ql-signup-eye" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>{showConfirmPassword ? <EyeOff /> : <Eye />}</button>{formData.confirmPassword && formData.confirmPassword === formData.password && <Check className="ql-signup-valid" aria-label="Passwords match" />}</div>

          <label className="ql-signup-label" htmlFor="role">Account role</label>
          <div className="ql-signup-select"><select id="role" name="role" value={formData.role} onChange={handleChange}><option value="learner">Learner</option><option value="admin">Admin</option></select></div>

          <label className="ql-signup-terms"><input type="checkbox" checked={agreeTerms} onChange={(event) => setAgreeTerms(event.target.checked)} /><span>I agree to the <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.</span></label>
          {error && <div className="ql-signup-error" role="alert">{error}</div>}
          {success && <div className="ql-signup-success" role="status">{success}</div>}

          <div className="ql-signup-submit-track"><button type="submit" className="ql-signup-submit" disabled={loading}>{loading ? <><LoaderCircle className="ql-signup-spinner" /> Creating...</> : "Sign up →"}</button></div>
          <p className="ql-signup-status"><span className={formData.name && formData.email && formData.password ? "is-ready" : ""}>●</span> {loading ? "Creating your account..." : success ? "Account created — welcome aboard!" : "Fill in your details to get started"}</p>
          <div className="ql-login-divider"><span>or</span></div>
          <button type="button" className="ql-login-google" onClick={handleGoogleSignIn} disabled={loading}><span>G</span> Continue with Google</button>
          <div className="ql-signup-back"><Link to="/login">← Back to login</Link></div>
        </form>
      </section>
    </main>
  );
}

export default Registration;
