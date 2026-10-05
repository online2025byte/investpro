import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export default function MyInvestments({ user, onBack }) {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setInvestments([]);
      setLoading(false);
      return;
    }

    const investmentsRef = collection(db, "investments");

    const q = query(
      investmentsRef,
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        data.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;

          return bTime - aTime;
        });

        setInvestments(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading investments:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "Pending";

    return timestamp.toDate().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDate = (timestamp) => {
    if (!timestamp?.toDate) return null;
    return timestamp.toDate();
  };

  const formatMoney = (amount) => {
    return Number(amount || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getStatusClass = (status) => {
    if (status === "active") return "portfolio-status-active";
    if (status === "completed") return "portfolio-status-completed";
    if (status === "pending") return "portfolio-status-pending";

    return "portfolio-status-default";
  };

  const getStatusLabel = (status) => {
    if (!status) return "Pending";

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getMaturityDate = (investment) => {
    const startDate = getDate(investment.createdAt);

    if (!startDate) return "Pending";

    const maturityDate = new Date(startDate);

    maturityDate.setDate(
      maturityDate.getDate() +
        Number(investment.duration || 0)
    );

    return maturityDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getProgress = (investment) => {
    if (investment.status === "completed") {
      return 100;
    }

    const startDate = getDate(investment.createdAt);

    if (!startDate) {
      return 0;
    }

    const durationDays = Number(investment.duration || 0);

    if (!durationDays) {
      return 0;
    }

    const now = new Date();

    const elapsed =
      (now.getTime() - startDate.getTime()) /
      (1000 * 60 * 60 * 24);

    const progress =
      (elapsed / durationDays) * 100;

    return Math.min(
      100,
      Math.max(0, progress)
    );
  };

  const portfolioStats = useMemo(() => {
    const totalInvested = investments.reduce(
      (total, investment) =>
        total + Number(investment.amount || 0),
      0
    );

    const projectedProfit = investments.reduce(
      (total, investment) =>
        total +
        Number(investment.projectedProfit || 0),
      0
    );

    const projectedTotal = investments.reduce(
      (total, investment) =>
        total +
        Number(investment.projectedTotal || 0),
      0
    );

    const active = investments.filter(
      (investment) =>
        investment.status === "active"
    ).length;

    const pending = investments.filter(
      (investment) =>
        investment.status === "pending"
    ).length;

    const completed = investments.filter(
      (investment) =>
        investment.status === "completed"
    ).length;

    return {
      totalInvested,
      projectedProfit,
      projectedTotal,
      active,
      pending,
      completed,
    };
  }, [investments]);

  return (
    <div className="premium-portfolio-page">
      {/* TOP BAR */}

      <header className="portfolio-topbar">
        <button
          className="portfolio-back-btn"
          onClick={onBack}
        >
          <span>←</span>
          Dashboard
        </button>

        <div className="portfolio-brand">
          <div className="portfolio-brand-mark">
            I
          </div>

          <strong>
            Invest<span>Pro</span>
          </strong>
        </div>

        <div className="portfolio-security">
          <span className="portfolio-live-dot"></span>
          Portfolio
        </div>
      </header>

      <main className="portfolio-main">
        {/* HEADER */}

        <section className="portfolio-header">
          <div>
            <span className="portfolio-eyebrow">
              INVESTMENT PORTFOLIO
            </span>

            <h1>My Investments</h1>

            <p>
              Track your investments, projected returns and
              portfolio performance.
            </p>
          </div>

          <button
            className="portfolio-invest-btn"
            onClick={onBack}
          >
            <span>＋</span>
            New Investment
          </button>
        </section>

        {/* PORTFOLIO OVERVIEW */}

        {!loading && investments.length > 0 && (
          <section className="portfolio-overview-card">
            <div className="portfolio-overview-main">
              <div className="portfolio-overview-label">
                <span className="portfolio-balance-dot"></span>
                TOTAL PORTFOLIO VALUE
              </div>

              <h2>
                ${formatMoney(
                  portfolioStats.projectedTotal
                )}
              </h2>

              <div className="portfolio-profit-line">
                <span>Projected growth</span>

                <strong>
                  +$
                  {formatMoney(
                    portfolioStats.projectedProfit
                  )}
                </strong>
              </div>
            </div>

            <div className="portfolio-overview-side">
              <div className="portfolio-overview-side-item">
                <span>Total invested</span>

                <strong>
                  $
                  {formatMoney(
                    portfolioStats.totalInvested
                  )}
                </strong>
              </div>

              <div className="portfolio-overview-side-item">
                <span>Active positions</span>

                <strong>
                  {portfolioStats.active}
                </strong>
              </div>
            </div>

            <div className="portfolio-overview-decoration">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </section>
        )}

        {/* STATS */}

        {!loading && investments.length > 0 && (
          <section className="portfolio-stat-grid">
            <PortfolioStat
              icon="◈"
              label="Total Invested"
              value={`$${formatMoney(
                portfolioStats.totalInvested
              )}`}
              className="green"
            />

            <PortfolioStat
              icon="↗"
              label="Projected Profit"
              value={`+$${formatMoney(
                portfolioStats.projectedProfit
              )}`}
              className="profit"
            />

            <PortfolioStat
              icon="◷"
              label="Pending"
              value={portfolioStats.pending}
              className="orange"
            />

            <PortfolioStat
              icon="✓"
              label="Completed"
              value={portfolioStats.completed}
              className="blue"
            />
          </section>
        )}

        {/* INVESTMENT LIST */}

        <section className="portfolio-investments-section">
          <div className="portfolio-section-heading">
            <div>
              <span>YOUR POSITIONS</span>

              <h2>Investment Portfolio</h2>
            </div>

            {!loading && investments.length > 0 && (
              <div className="portfolio-count">
                {investments.length}{" "}
                {investments.length === 1
                  ? "Investment"
                  : "Investments"}
              </div>
            )}
          </div>

          {loading ? (
            <PortfolioLoading />
          ) : investments.length === 0 ? (
            <EmptyPortfolio onBack={onBack} />
          ) : (
            <div className="premium-investment-list">
              {investments.map((investment) => (
                <PortfolioInvestmentCard
                  key={investment.id}
                  investment={investment}
                  formatDate={formatDate}
                  formatMoney={formatMoney}
                  getStatusClass={getStatusClass}
                  getStatusLabel={getStatusLabel}
                  getMaturityDate={getMaturityDate}
                  getProgress={getProgress}
                />
              ))}
            </div>
          )}
        </section>

        {/* DISCLOSURE */}

        <div className="portfolio-disclosure">
          <span>i</span>

          <p>
            Projected returns are estimates based on the
            investment plan selected at the time of investment.
            Actual results may vary and projected returns are not
            guaranteed.
          </p>
        </div>
      </main>
    </div>
  );
}


/* =========================================================
   STAT CARD
========================================================= */

function PortfolioStat({
  icon,
  label,
  value,
  className,
}) {
  return (
    <div className="portfolio-stat-card">
      <div
        className={`portfolio-stat-icon ${className}`}
      >
        {icon}
      </div>

      <div>
        <span>{label}</span>

        <strong>{value}</strong>
      </div>
    </div>
  );
}


/* =========================================================
   INVESTMENT CARD
========================================================= */

function PortfolioInvestmentCard({
  investment,
  formatDate,
  formatMoney,
  getStatusClass,
  getStatusLabel,
  getMaturityDate,
  getProgress,
}) {
  const progress = getProgress(investment);

  const projectedProfit = Number(
    investment.projectedProfit || 0
  );

  return (
    <article className="premium-portfolio-investment">
      {/* CARD HEADER */}

      <div className="portfolio-investment-header">
        <div className="portfolio-plan-identity">
          <div className="portfolio-plan-icon">
            {investment.planIcon || "📈"}
          </div>

          <div>
            <span>INVESTMENT PLAN</span>

            <h3>
              {investment.planName || "Investment Plan"}
            </h3>

            <p>
              Started{" "}
              {formatDate(investment.createdAt)}
            </p>
          </div>
        </div>

        <span
          className={`portfolio-status ${getStatusClass(
            investment.status
          )}`}
        >
          <i></i>

          {getStatusLabel(investment.status)}
        </span>
      </div>

      {/* MAIN VALUE */}

      <div className="portfolio-investment-value">
        <div>
          <span>INVESTMENT AMOUNT</span>

          <strong>
            ${formatMoney(investment.amount)}
          </strong>
        </div>

        <div className="portfolio-return-value">
          <span>PROJECTED PROFIT</span>

          <strong>
            +${formatMoney(projectedProfit)}
          </strong>
        </div>
      </div>

      {/* PROGRESS */}

      <div className="portfolio-progress-section">
        <div className="portfolio-progress-heading">
          <span>Investment progress</span>

          <strong>
            {Math.round(progress)}%
          </strong>
        </div>

        <div className="portfolio-progress-track">
          <div
            className="portfolio-progress-bar"
            style={{
              width: `${progress}%`,
            }}
          ></div>
        </div>

        <div className="portfolio-progress-dates">
          <span>
            {formatDate(investment.createdAt)}
          </span>

          <span>
            Maturity{" "}
            {getMaturityDate(investment)}
          </span>
        </div>
      </div>

      {/* DETAILS */}

      <div className="portfolio-investment-details">
        <div>
          <span>Projected Total</span>

          <strong>
            $
            {formatMoney(
              investment.projectedTotal
            )}
          </strong>
        </div>

        <div>
          <span>Return Rate</span>

          <strong>
            {investment.returnRate || 0}%
          </strong>
        </div>

        <div>
          <span>Duration</span>

          <strong>
            {investment.duration || 0} days
          </strong>
        </div>

        <div>
          <span>Maturity Date</span>

          <strong>
            {getMaturityDate(investment)}
          </strong>
        </div>
      </div>

      {/* FOOTER */}

      <div className="portfolio-investment-footer">
        <div className="portfolio-plan-note">
          <span>●</span>

          <p>
            {investment.status === "completed"
              ? "Investment completed"
              : investment.status === "active"
              ? "Investment is currently active"
              : "Investment awaiting approval"}
          </p>
        </div>

        <div className="portfolio-return-badge">
          {investment.returnRate || 0}% projected
        </div>
      </div>
    </article>
  );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyPortfolio({ onBack }) {
  return (
    <div className="portfolio-empty">
      <div className="portfolio-empty-visual">
        <div className="empty-chart-line">
          ↗
        </div>
      </div>

      <span className="portfolio-empty-label">
        YOUR PORTFOLIO IS READY
      </span>

      <h2>Start building your portfolio</h2>

      <p>
        You don't have any investments yet. Explore our
        investment plans and choose the strategy that best
        matches your goals.
      </p>

      <button
        className="portfolio-empty-action"
        onClick={onBack}
      >
        Explore Investment Plans
        <span>→</span>
      </button>
    </div>
  );
}


/* =========================================================
   LOADING
========================================================= */

function PortfolioLoading() {
  return (
    <div className="portfolio-loading-list">
      {[1, 2].map((item) => (
        <div
          className="portfolio-loading-card"
          key={item}
        >
          <div className="loading-top">
            <div className="loading-circle"></div>

            <div className="loading-lines">
              <span></span>
              <span></span>
            </div>
          </div>

          <div className="loading-big-line"></div>

          <div className="loading-small-grid">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      ))}
    </div>
  );
}