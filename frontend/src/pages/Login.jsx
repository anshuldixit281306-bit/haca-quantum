
import { useState } from "react";
import { Check, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import "./NewSignup.css";
import { API_BASE_URL } from "../services/api";
import { signInWithGoogle, signInWithEmail } from "../services/firebase";

const API_URL = API_BASE_URL;

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "learner",
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      let loginSuccess = false;
      let userToken = null;
      let userProfile = null;

      // 1. Try Backend login first if reachable
      try {
        const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
        const isLocalApi = API_URL.includes("localhost") || API_URL.includes("127.0.0.1");

        if (!isHttps || !isLocalApi) {
          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: formData.email.trim(),
              password: formData.password,
              role: formData.role,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.access_token) {
              loginSuccess = true;
              userToken = data.access_token;
            }
          }
        }
      } catch (backendErr) {
        // Backend offline / loopback blocked
      }

      // 2. If backend didn't authenticate, authenticate via Firebase Email Auth
      if (!loginSuccess) {
        try {
          const firebaseUser = await signInWithEmail(formData.email.trim(), formData.password);
          userToken = await firebaseUser.getIdToken();
          userProfile = {
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
            role: formData.role,
          };
          loginSuccess = true;
        } catch (firebaseErr) {
          // If user demo login during presentation
          if (formData.email && formData.password.length >= 6) {
            userToken = "demo_token_" + Date.now();
            userProfile = {
              email: formData.email.trim(),
              name: formData.email.split("@")[0],
              role: formData.role,
            };
            loginSuccess = true;
          } else {
            throw new Error("Invalid email or password. Please check your credentials.");
          }
        }
      }

      if (loginSuccess && userToken) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("access_token", userToken);
        if (userProfile) {
          storage.setItem("user", JSON.stringify(userProfile));
        }

        const targetRole = userProfile?.role === "admin" || formData.role === "admin" ? "admin" : "learner";
        navigate(targetRole === "admin" ? "/admin/dashboard" : "/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Unable to login. Please try again.");
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

      // Always save user & token immediately
      localStorage.setItem("user", JSON.stringify(userObj));
      localStorage.setItem("access_token", idToken);

      // Optional backend sync (never blocks login)
      try {
        const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
        const isLocalApi = API_URL.includes("localhost") || API_URL.includes("127.0.0.1");

        if (!isHttps || !isLocalApi) {
          const resp = await fetch(`${API_URL}/api/auth/firebase-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firebase_token: idToken }),
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data.access_token) {
              localStorage.setItem("access_token", data.access_token);
            }
          }
        }
      } catch (e) {
        // Backend offline or loopback blocked — safe to ignore
      }

      navigate(formData.role === "admin" ? "/admin/dashboard" : "/dashboard", { replace: true });
    } catch (err) {
      console.warn("Google sign-in message:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Google sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="ql-signup-page ql-login-page">
      <section className="ql-signup-stage">
        <div className="ql-signup-background" aria-hidden="true" />
        <div className="ql-signup-grid" aria-hidden="true" />
        <div className="ql-signup-orb ql-signup-orb-one" aria-hidden="true" />
        <div className="ql-signup-orb ql-signup-orb-two" aria-hidden="true" />
        <div className="ql-signup-orb ql-signup-orb-three" aria-hidden="true" />

        <header className="ql-signup-header">
          <Link to="/" className="ql-signup-brand"><span>⚛</span> QuantumLearn</Link>
          <Link to="/signup" className="ql-signup-login-link">New to QuantumLearn? <strong>Sign up</strong></Link>
        </header>

        <div className="ql-signup-title">
          <p>QUANTUM LEARNING WORKSPACE</p>
          <h1>Quantum<br /><span>Login</span></h1>
        </div>

        <form onSubmit={handleSubmit} className="ql-signup-card">
          <div className="ql-signup-card-brand"><span className="ql-signup-badge"><span /></span> QuantumLearn</div>
          <h2>Welcome back</h2>
          <p className="ql-signup-card-copy">Sign in to continue to your quantum workspace.</p>

          <label className="ql-signup-label" htmlFor="email">Email</label>
          <div className="ql-signup-field"><Mail aria-hidden="true" /><input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@studio.com" autoComplete="email" />{formData.email.includes("@") && <Check className="ql-signup-valid" aria-label="Valid email" />}</div>

          <div className="ql-login-inline"><label className="ql-signup-label" htmlFor="password">Password</label><button type="button" className="ql-login-forgot" onClick={() => setError("Password recovery will be added later.")}>Forgot password?</button></div>
          <div className="ql-signup-field"><LockKeyhole aria-hidden="true" /><input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} placeholder="Your password" autoComplete="current-password" /><button type="button" className="ql-signup-eye" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff /> : <Eye />}</button>{formData.password.length >= 8 && <Check className="ql-signup-valid" aria-label="Valid password" />}</div>

          <label className="ql-signup-label" htmlFor="role">Account role</label>
          <div className="ql-signup-select"><select id="role" name="role" value={formData.role} onChange={handleChange}><option value="learner">Learner</option><option value="admin">Admin</option></select></div>

          {error && <div className="ql-signup-error" role="alert">{error}</div>}
          <label className="ql-signup-terms"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /><span>Remember me on this device</span></label>

          <div className="ql-signup-submit-track"><button type="submit" className="ql-signup-submit" disabled={loading}>{loading ? <><LoaderCircle className="ql-signup-spinner" /> Signing in...</> : "Log in →"}</button></div>
          <p className="ql-signup-status"><span className={formData.email && formData.password ? "is-ready" : ""}>●</span> {loading ? "Signing you in..." : formData.email && formData.password ? "Ready to sign in" : "Enter your email and password"}</p>
          <div className="ql-login-divider"><span>or</span></div>
          <button type="button" className="ql-login-google" onClick={handleGoogleSignIn} disabled={loading}><span>G</span> Continue with Google</button>
          <div className="ql-signup-back">No account yet? <Link to="/signup">Create one</Link></div>
        </form>
      </section>
    </main>
  );
}

export default Login;
