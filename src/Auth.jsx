import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";

export default function Auth({
  onSuccess,
  onClose,
  initialMode = "login",
}) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isLogin = mode === "login";

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!isLogin && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      if (!isLogin) {
        // ================================
        // CREATE NEW ACCOUNT
        // ================================

        const result =
          await createUserWithEmailAndPassword(
            auth,
            email.trim(),
            password
          );

        await setDoc(
          doc(db, "users", result.user.uid),
          {
            uid: result.user.uid,
            name: name.trim(),
            email: email.trim(),
            createdAt: serverTimestamp(),

            // Initial values ONLY for a brand-new account
            balance: 0,
            totalInvested: 0,
            totalProfit: 0,
            activeInvestments: 0,
          }
        );

        onSuccess(result.user);

      } else {
        // ================================
        // LOGIN EXISTING ACCOUNT
        // ================================

        const result =
          await signInWithEmailAndPassword(
            auth,
            email.trim(),
            password
          );

        /*
         * IMPORTANT:
         *
         * Do NOT write balance, totalInvested,
         * totalProfit, etc. during login.
         *
         * App.jsx already listens to the user's
         * Firestore document with onSnapshot().
         *
         * This means an approved deposit or
         * withdrawal will automatically appear.
         */

        onSuccess(result.user);
      }

    } catch (err) {
      console.error(
        "Authentication error:",
        err
      );

      if (
        err.code ===
        "auth/email-already-in-use"
      ) {
        setError(
          "This email is already registered."
        );

      } else if (
        err.code ===
        "auth/invalid-email"
      ) {
        setError(
          "Please enter a valid email address."
        );

      } else if (
        err.code ===
          "auth/invalid-credential" ||
        err.code ===
          "auth/wrong-password" ||
        err.code ===
          "auth/user-not-found"
      ) {
        setError(
          "Incorrect email or password."
        );

      } else if (
        err.code ===
        "auth/weak-password"
      ) {
        setError(
          "Password must be at least 6 characters."
        );

      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setError("");
    setMode(
      isLogin
        ? "register"
        : "login"
    );
  };

  return (
    <div className="auth-screen">

      <div className="auth-background-glow auth-glow-one" />
      <div className="auth-background-glow auth-glow-two" />

      <div className="auth-layout">

        {/* LEFT BRAND PANEL */}

        <section className="auth-showcase">

          <div className="auth-showcase-inner">

            <div className="auth-brand">

              <div className="auth-brand-mark">
                <span>₿</span>
              </div>

              <div>
                <strong>
                  InvestPro
                </strong>

                <small>
                  SMARTER WEALTH. BETTER FUTURE.
                </small>
              </div>

            </div>

            <div className="auth-showcase-content">

              <span className="auth-eyebrow">
                <span className="auth-eyebrow-dot" />
                SECURE INVESTMENT PLATFORM
              </span>

              <h1>
                Build your wealth
                <br />
                with confidence.
              </h1>

              <p>
                Access a modern investment experience designed
                to help you manage your portfolio, track returns,
                and grow your financial goals.
              </p>

              <div className="auth-feature-list">

                <div className="auth-feature">

                  <div className="auth-feature-icon">
                    ✓
                  </div>

                  <div>
                    <strong>
                      Simple investing
                    </strong>

                    <span>
                      Choose an investment plan that fits your goals.
                    </span>
                  </div>

                </div>

                <div className="auth-feature">

                  <div className="auth-feature-icon">
                    ↗
                  </div>

                  <div>
                    <strong>
                      Track your portfolio
                    </strong>

                    <span>
                      Monitor your investments and projected returns.
                    </span>
                  </div>

                </div>

                <div className="auth-feature">

                  <div className="auth-feature-icon">
                    ◆
                  </div>

                  <div>
                    <strong>
                      Built with security in mind
                    </strong>

                    <span>
                      Your account information stays protected.
                    </span>
                  </div>

                </div>

              </div>

            </div>

            <div className="auth-showcase-footer">
              <span>InvestPro</span>
              <span>•</span>
              <span>
                Investment made simple
              </span>
            </div>

          </div>

        </section>


        {/* FORM PANEL */}

        <section className="auth-form-panel">

          <div className="auth-form-card">

            <button
              className="auth-close"
              onClick={onClose}
              type="button"
              aria-label="Close"
            >
              ×
            </button>

            <div className="auth-mobile-brand">

              <div className="auth-brand-mark">
                <span>₿</span>
              </div>

              <strong>
                InvestPro
              </strong>

            </div>

            <div className="auth-heading">

              <span className="auth-form-label">
                {isLogin
                  ? "MEMBER LOGIN"
                  : "GET STARTED"}
              </span>

              <h2>
                {isLogin
                  ? "Welcome back."
                  : "Create your account."}
              </h2>

              <p>
                {isLogin
                  ? "Sign in to continue to your investment dashboard."
                  : "Join InvestPro and start managing your investment journey."}
              </p>

            </div>


            {error && (
              <div className="auth-error-box">

                <span className="auth-error-icon">
                  !
                </span>

                <div>

                  <strong>
                    Unable to continue
                  </strong>

                  <p>
                    {error}
                  </p>

                </div>

              </div>
            )}


            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >

              {!isLogin && (
                <div className="auth-field">

                  <label htmlFor="auth-name">
                    Full name
                  </label>

                  <div className="auth-input-wrap">

                    <span className="auth-input-icon">
                      ◉
                    </span>

                    <input
                      id="auth-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                      autoComplete="name"
                      disabled={loading}
                    />

                  </div>

                </div>
              )}


              <div className="auth-field">

                <label htmlFor="auth-email">
                  Email address
                </label>

                <div className="auth-input-wrap">

                  <span className="auth-input-icon">
                    @
                  </span>

                  <input
                    id="auth-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    autoComplete="email"
                    disabled={loading}
                  />

                </div>

              </div>


              <div className="auth-field">

                <div className="auth-label-row">

                  <label htmlFor="auth-password">
                    Password
                  </label>

                  {isLogin && (
                    <span className="auth-secure-label">
                      Secure login
                    </span>
                  )}

                </div>

                <div className="auth-input-wrap">

                  <span className="auth-input-icon">
                    •••
                  </span>

                  <input
                    id="auth-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    autoComplete={
                      isLogin
                        ? "current-password"
                        : "new-password"
                    }
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current
                      )
                    }
                    tabIndex={-1}
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

                {!isLogin && (
                  <span className="auth-password-hint">
                    Use at least 6 characters.
                  </span>
                )}

              </div>


              <button
                className="auth-submit-btn"
                type="submit"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="auth-spinner" />

                    {isLogin
                      ? "Signing you in..."
                      : "Creating your account..."}
                  </>
                ) : (
                  <>
                    {isLogin
                      ? "Sign In"
                      : "Create Account"}

                    <span className="auth-submit-arrow">
                      →
                    </span>
                  </>
                )}

              </button>

            </form>


            <div className="auth-divider">
              <span>OR</span>
            </div>


            <div className="auth-switch">

              <span>
                {isLogin
                  ? "Don't have an InvestPro account?"
                  : "Already have an InvestPro account?"}
              </span>

              <button
                type="button"
                onClick={switchMode}
                disabled={loading}
              >
                {isLogin
                  ? "Create account"
                  : "Sign in"}
              </button>

            </div>


            <div className="auth-security-note">

              <span>🔒</span>

              <p>
                Your connection is protected and your
                account credentials are securely handled.
              </p>

            </div>

          </div>

        </section>

      </div>

    </div>
  );
}