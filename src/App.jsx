import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  doc,
  onSnapshot,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "./firebase";

import Auth from "./Auth";
import InvestmentPlans from "./InvestmentPlans";
import MyInvestments from "./MyInvestments";
import Wallet from "./Wallet";
import AdminDashboard from "./AdminDashboard";

import DashboardHome from "./DashboardHome";
import SideMenu from "./SideMenu";
import BottomNav from "./BottomNav";
import Profile from "./Profile";
import Security from "./Security";
import HelpSupport from "./HelpSupport";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState("dashboard");
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // ==========================================
  // AUTH + REAL-TIME USER DATA
  // ==========================================

  useEffect(() => {
    let unsubscribeUserData = null;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);

        if (unsubscribeUserData) {
          unsubscribeUserData();
          unsubscribeUserData = null;
        }

        if (currentUser) {
          const userRef = doc(
            db,
            "users",
            currentUser.uid
          );

          unsubscribeUserData = onSnapshot(
            userRef,
            (userSnap) => {
              if (userSnap.exists()) {
                setUserData(userSnap.data());
              } else {
                setUserData(null);
              }

              setLoading(false);
            },
            (error) => {
              console.error(
                "Error listening to user:",
                error
              );

              setUserData(null);
              setLoading(false);
            }
          );
        } else {
          setUserData(null);
          setLoading(false);
        }
      }
    );

    return () => {
      unsubscribeAuth();

      if (unsubscribeUserData) {
        unsubscribeUserData();
      }
    };
  }, []);

  // ==========================================
  // AUTH ACTIONS
  // ==========================================

  const openLogin = () => {
    setAuthMode("login");
    setShowAuth(true);
  };

  const openRegister = () => {
    setAuthMode("register");
    setShowAuth(true);
  };

  const handleAuthSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setShowAuth(false);
    setPage("dashboard");
  };

  const handleLogout = async () => {
  try {
    setShowAccountMenu(false);

    await signOut(auth);

    setUser(null);
    setUserData(null);
    setPage("dashboard");
  } catch (error) {
    console.error(
      "Logout error:",
      error
    );
  }
};

  // ==========================================
  // PAGE NAVIGATION
  // ==========================================

  const navigate = (nextPage) => {
    setPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {
    return (
      <div className="loading-screen">

        <div className="loading-brand">

          <div className="loading-logo-mark">
            ₿
          </div>

          <div>
            <strong>
              Invest<span>Pro</span>
            </strong>

            <small>
              Smart investing, simplified
            </small>
          </div>

        </div>

        <div className="loading-spinner"></div>

        <p>
          Preparing your dashboard...
        </p>

      </div>
    );
  }

  // ==========================================
  // LOGGED-IN USER
  // ==========================================

  if (user) {

    /*
     * IMPORTANT:
     * The app shell stays mounted for EVERY
     * logged-in page.
     *
     * This means the SideMenu, topbar and
     * BottomNav don't disappear when the user
     * changes pages.
     */

    let pageContent = null;

    // ------------------------------------------
    // DASHBOARD
    // ------------------------------------------

    if (page === "dashboard") {
      pageContent = (
        <DashboardHome
          user={user}
          userData={userData}
          onNavigate={navigate}
        />
      );
    }

    // ------------------------------------------
    // INVESTMENT PLANS
    // ------------------------------------------

    else if (page === "investments") {
      pageContent = (
        <InvestmentPlans
          onBack={() =>
            navigate("dashboard")
          }

          onInvest={async (investment) => {
            try {
              const amount = Number(
                investment.amount || 0
              );

              const balance = Number(
                userData?.balance || 0
              );

              if (
                !Number.isFinite(amount) ||
                amount <= 0
              ) {
                alert(
                  "Please enter a valid investment amount."
                );

                return;
              }

              if (amount > balance) {
                alert(
                  `Insufficient balance.\n\nYour available balance is $${balance.toFixed(
                    2
                  )}.`
                );

                return;
              }

              await addDoc(
                collection(
                  db,
                  "investments"
                ),
                {
                  userId: user.uid,

                  planId:
                    investment.plan.id,

                  planName:
                    investment.plan.name,

                  planIcon:
                    investment.plan.icon,

                  amount,

                  returnRate:
                    investment.plan.returnRate,

                  duration:
                    investment.plan.duration,

                  projectedProfit:
                    investment.projectedProfit,

                  projectedTotal:
                    investment.projectedTotal,

                  status:
                    "pending",

                  createdAt:
                    serverTimestamp(),
                }
              );

              alert(
                "Investment request created successfully. It is currently pending."
              );

              navigate(
                "my-investments"
              );

            } catch (error) {
              console.error(
                "Investment creation error:",
                error
              );

              alert(
                "We couldn't create the investment request. Please try again."
              );
            }
          }}
        />
      );
    }

    // ------------------------------------------
    // MY INVESTMENTS
    // ------------------------------------------

    else if (
      page === "my-investments"
    ) {
      pageContent = (
        <MyInvestments
          user={user}
          onBack={() =>
            navigate("dashboard")
          }
        />
      );
    }

      // ------------------------------------------
// PROFILE
// ------------------------------------------

else if (page === "profile") {
  pageContent = (
    <Profile
      user={user}
      userData={userData}
      onBack={() =>
        navigate("dashboard")
      }
      onLogout={handleLogout}
    />
  );
}
    // ------------------------------------------
// SECURITY
// ------------------------------------------

else if (page === "security") {
  pageContent = (
    <Security
      user={user}
      onBack={() =>
        navigate("dashboard")
      }
      onLogout={handleLogout}
    />
  );
}

// ------------------------------------------
// HELP & SUPPORT
// ------------------------------------------

else if (page === "support") {
  pageContent = (
    <HelpSupport
      onBack={() =>
        navigate("dashboard")
      }
    />
  );
}
    // ------------------------------------------
    // WALLET
    // ------------------------------------------

    else if (page === "wallet") {
      pageContent = (
        <Wallet
          user={user}
          userData={userData}
          onBack={() =>
            navigate("dashboard")
          }
        />
      );
    }

    // ------------------------------------------
    // ADMIN
    // ------------------------------------------

    else if (
      page === "admin" &&
      userData?.role === "admin"
    ) {
      pageContent = (
        <AdminDashboard
          user={user}
          onBack={() =>
            navigate("dashboard")
          }
        />
      );
    }

    // ------------------------------------------
    // SAFETY FALLBACK
    // ------------------------------------------

    else {
      pageContent = (
        <DashboardHome
          user={user}
          userData={userData}
          onNavigate={navigate}
        />
      );
    }

    // ==========================================
    // ONE PERMANENT APP SHELL
    // ==========================================

    return (
      <div className="app-shell">

        {/* ======================================
            DESKTOP SIDE MENU
        ======================================= */}

        <SideMenu
          page={page}
          user={user}
          userData={userData}
          onNavigate={navigate}
          onLogout={handleLogout}
        />

        {/* ======================================
            MAIN AREA
        ======================================= */}

        <div className="main-area">

          {/* ====================================
              TOP HEADER
          ===================================== */}

          <header className="app-topbar">

            <div className="mobile-brand">

              <div className="brand-mark">
                ₿
              </div>

              <strong>
                Invest<span>Pro</span>
              </strong>

            </div>

            <div className="topbar-user-wrapper">

  <button
    type="button"
    className="topbar-user"
    onClick={() =>
      setShowAccountMenu((current) => !current)
    }
    aria-label="Open account menu"
    aria-expanded={showAccountMenu}
  >

    <div className="topbar-avatar">

      {(
        userData?.name ||
        user.email ||
        "U"
      )
        .charAt(0)
        .toUpperCase()}

    </div>

    <div className="topbar-user-info">

      <strong>
        {userData?.name ||
          user.email
            ?.split("@")[0] ||
          "Investor"}
      </strong>

      <span>
        Investor Account
      </span>

    </div>

    <span className="account-chevron">
      {showAccountMenu ? "⌃" : "⌄"}
    </span>

  </button>


  {showAccountMenu && (
    <div className="mobile-account-menu">

      <div className="account-menu-header">

        <div className="account-menu-avatar">

          {(
            userData?.name ||
            user.email ||
            "U"
          )
            .charAt(0)
            .toUpperCase()}

        </div>

        <div className="account-menu-user">

          <strong>
            {userData?.name ||
              user.email
                ?.split("@")[0] ||
              "Investor"}
          </strong>

          <span>
            {user.email}
          </span>

        </div>

      </div>


      <div className="account-menu-divider"></div>


      <button
        type="button"
        className="account-menu-item"
        onClick={() => {
  setShowAccountMenu(false);
  navigate("profile");
}}
      >
        <span className="account-menu-icon">
          ◉
        </span>

        <span>
          Profile
        </span>
      </button>


      <button
        type="button"
        className="account-menu-item"
        onClick={() => {
  setShowAccountMenu(false);
  navigate("security");
}}
      >
        <span className="account-menu-icon">
          ◇
        </span>

        <span>
          Security
        </span>
      </button>


      <button
        type="button"
        className="account-menu-item"
        onClick={() => {
  setShowAccountMenu(false);
  navigate("support");
}}
      >
        <span className="account-menu-icon">
          ?
        </span>

        <span>
          Help & Support
        </span>
      </button>


      <div className="account-menu-divider"></div>


      <button
        type="button"
        className="account-menu-item logout-item"
        onClick={handleLogout}
      >
        <span className="account-menu-icon">
          ↪
        </span>

        <span>
          Log out
        </span>
      </button>

    </div>
  )}

</div>

          </header>

          {/* ====================================
              CURRENT PAGE
          ===================================== */}

          <main className="main-content">
            {pageContent}
          </main>

          {/* ====================================
              MOBILE BOTTOM NAVIGATION
          ===================================== */}

          <BottomNav
            page={page}
            onNavigate={navigate}
          />

        </div>

      </div>
    );
  }

  // ==========================================
  // PUBLIC LANDING PAGE
  // ==========================================

  return (
    <div className="public-app">

      {/* ======================================
          PUBLIC NAVBAR
      ======================================= */}

      <header className="public-navbar">

        <div className="public-logo">

          <div className="brand-mark">
            ₿
          </div>

          <strong>
            Invest<span>Pro</span>
          </strong>

        </div>

        <div className="public-nav-actions">

          <button
            className="public-login-button"
            onClick={openLogin}
          >
            Login
          </button>

          <button
            className="public-register-button"
            onClick={openRegister}
          >
            Get Started
          </button>

        </div>

      </header>

      {/* ======================================
          HERO
      ======================================= */}

      <main>

        <section className="landing-hero">

          <div className="landing-hero-content">

            <div className="landing-badge">
              <span>✦</span>
              Smart investing made simple
            </div>

            <h1>
              Build Your
              <span>
                Financial Future.
              </span>
            </h1>

            <p>
              A simple and modern platform
              designed to help you manage your
              investments, monitor your portfolio,
              and stay in control of your financial
              journey.
            </p>

            <div className="landing-buttons">

              <button
                className="landing-primary"
                onClick={openRegister}
              >
                Start Investing
                <span>→</span>
              </button>

              <button
                className="landing-secondary"
                onClick={openLogin}
              >
                Sign In
              </button>

            </div>

            <div className="landing-trust">

              <div className="trust-avatars">
                <span>J</span>
                <span>M</span>
                <span>A</span>
                <span>+</span>
              </div>

              <div>

                <strong>
                  Built for modern investors
                </strong>

                <small>
                  Simple • Secure • Transparent
                </small>

              </div>

            </div>

          </div>

          {/* ==================================
              PORTFOLIO PREVIEW
          =================================== */}

          <div className="hero-dashboard-preview">

            <div className="preview-glow"></div>

            <div className="preview-card">

              <div className="preview-header">

                <div>

                  <span>
                    Total portfolio
                  </span>

                  <h3>
                    $25,840.00
                  </h3>

                </div>

                <div className="preview-avatar">
                  ₿
                </div>

              </div>

              <div className="preview-profit">

                <strong>
                  +12.48%
                </strong>

                <span>
                  This month
                </span>

              </div>

              <div className="preview-chart">

                <svg
                  viewBox="0 0 500 190"
                  preserveAspectRatio="none"
                >

                  <defs>

                    <linearGradient
                      id="previewArea"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor="#16a36a"
                        stopOpacity="0.28"
                      />

                      <stop
                        offset="100%"
                        stopColor="#16a36a"
                        stopOpacity="0"
                      />

                    </linearGradient>

                  </defs>

                  <path
                    d="M0,150 C45,145 55,110 90,125 C125,140 135,90 175,105 C210,120 220,65 255,82 C295,100 310,72 345,80 C385,90 405,35 440,52 C465,64 475,28 500,20 L500,190 L0,190 Z"
                    fill="url(#previewArea)"
                  />

                  <path
                    d="M0,150 C45,145 55,110 90,125 C125,140 135,90 175,105 C210,120 220,65 255,82 C295,100 310,72 345,80 C385,90 405,35 440,52 C465,64 475,28 500,20"
                    fill="none"
                    stroke="#16a36a"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                </svg>

              </div>

              <div className="preview-bottom">

                <div>
                  <small>
                    Invested
                  </small>

                  <strong>
                    $22,960
                  </strong>
                </div>

                <div>
                  <small>
                    Profit
                  </small>

                  <strong>
                    $2,880
                  </strong>
                </div>

                <div>
                  <small>
                    Return
                  </small>

                  <strong>
                    12.48%
                  </strong>
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ======================================
            FEATURES
        ======================================= */}

        <section className="landing-features">

          <div className="landing-section-heading">

            <span>
              WHY INVESTPRO
            </span>

            <h2>
              Everything you need
              <br />
              in one place.
            </h2>

          </div>

          <div className="landing-feature-grid">

            <div className="landing-feature">

              <div className="feature-number">
                01
              </div>

              <div className="feature-icon">
                ◈
              </div>

              <h3>
                Simple investing
              </h3>

              <p>
                Explore available investment
                plans and manage your investment
                journey from one dashboard.
              </p>

            </div>

            <div className="landing-feature">

              <div className="feature-number">
                02
              </div>

              <div className="feature-icon">
                ◉
              </div>

              <h3>
                Clear portfolio view
              </h3>

              <p>
                See your balance, investments,
                returns and account activity in
                one organized place.
              </p>

            </div>

            <div className="landing-feature">

              <div className="feature-number">
                03
              </div>

              <div className="feature-icon">
                ◆
              </div>

              <h3>
                Account protection
              </h3>

              <p>
                Your account is connected to
                Firebase authentication and your
                personal dashboard.
              </p>

            </div>

          </div>

        </section>

        {/* ======================================
            LANDING FOOTER
        ======================================= */}

        <footer className="landing-footer">

          <div className="public-logo">

            <div className="brand-mark">
              ₿
            </div>

            <strong>
              Invest<span>Pro</span>
            </strong>

          </div>

          <p>
            Investment management made simple.
          </p>

          <span>
            © {new Date().getFullYear()} InvestPro
          </span>

        </footer>

      </main>

      {/* ======================================
          AUTH MODAL
      ======================================= */}

      {showAuth && (
        <Auth
          onSuccess={handleAuthSuccess}
          onClose={() =>
            setShowAuth(false)
          }
          initialMode={authMode}
        />
      )}

    </div>
  );
}

export default App;