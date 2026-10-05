import { useState } from "react";

const plans = [
  {
    id: "starter",
    name: "Starter",
    icon: "🌱",
    returnRate: 150,
    duration: 1,
    min: 100,
    max: 999,
    description: "A simple starting point for building your investment portfolio.",
  },
  {
    id: "growth",
    name: "Growth",
    icon: "🚀",
    returnRate: 250,
    duration: 5,
    min: 1000,
    max: 9999,
    popular: true,
    description: "Designed for investors looking for stronger portfolio growth.",
  },
  {
    id: "premium",
    name: "Premium",
    icon: "💎",
    returnRate: 350,
    duration: 10,
    min: 10000,
    max: 100000,
    description: "Our highest investment tier for larger portfolio allocations.",
  },
];

const formatMoney = (value) =>
  Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function InvestmentPlans({ onBack, onInvest }) {
  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <div className="premium-plans-page">
      {/* TOP BAR */}
      <header className="investment-topbar">
        <button className="investment-back-btn" onClick={onBack}>
          <span>←</span>
          Dashboard
        </button>

        <div className="investment-brand">
          <div className="investment-brand-mark">I</div>
          <strong>
            Invest<span>Pro</span>
          </strong>
        </div>

        <div className="investment-security">
          <span className="investment-live-dot"></span>
          Secure Investing
        </div>
      </header>

      <main className="investment-main">
        {/* HERO */}
        <section className="investment-intro">
          <div className="investment-intro-copy">
            <span className="investment-eyebrow">
              INVESTMENT CENTER
            </span>

            <h1>
              Put your money to work.
            </h1>

            <p>
              Choose an investment strategy that matches your goals,
              investment amount and preferred time horizon.
            </p>
          </div>

          <div className="investment-intro-summary">
            <div className="intro-summary-icon">↗</div>

            <div>
              <span>AVAILABLE PLANS</span>
              <strong>{plans.length} Plans</strong>
            </div>
          </div>
        </section>

        {/* PLAN GRID */}
        <section className="premium-plan-grid">
          {plans.map((plan) => (
            <InvestmentPlanCard
              key={plan.id}
              plan={plan}
              onSelect={() => setSelectedPlan(plan)}
            />
          ))}
        </section>

        {/* HOW IT WORKS */}
        <section className="investment-process-card">
          <div className="process-heading">
            <span>HOW IT WORKS</span>
            <h2>Start investing in three simple steps</h2>
          </div>

          <div className="process-grid">
            <div className="process-step">
              <div className="process-number">01</div>

              <div>
                <strong>Choose a plan</strong>
                <p>
                  Select an investment plan based on your preferred
                  amount and duration.
                </p>
              </div>
            </div>

            <div className="process-line"></div>

            <div className="process-step">
              <div className="process-number">02</div>

              <div>
                <strong>Choose your amount</strong>
                <p>
                  Enter the amount you want to allocate to your
                  selected investment plan.
                </p>
              </div>
            </div>

            <div className="process-line"></div>

            <div className="process-step">
              <div className="process-number">03</div>

              <div>
                <strong>Track your investment</strong>
                <p>
                  Monitor your investment and projected returns from
                  your portfolio.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* RISK NOTICE */}
        <section className="investment-risk-notice">
          <div className="risk-icon">i</div>

          <div>
            <strong>Investment disclosure</strong>

            <p>
              Projected returns shown on this page are estimates based
              on the selected plan terms. Actual investment performance
              may vary, and returns are not guaranteed.
            </p>
          </div>
        </section>
      </main>

      {selectedPlan && (
        <InvestmentModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onInvest={onInvest}
        />
      )}
    </div>
  );
}


/* =========================================================
   PLAN CARD
========================================================= */

function InvestmentPlanCard({ plan, onSelect }) {
  return (
    <article
      className={`premium-investment-card ${
        plan.popular ? "premium-plan-featured" : ""
      }`}
    >
      {plan.popular && (
        <div className="premium-popular-badge">
          <span>★</span>
          MOST POPULAR
        </div>
      )}

      <div className="premium-plan-top">
        <div className={`premium-plan-icon ${plan.id}`}>
          {plan.icon}
        </div>

        <div className="premium-plan-title">
          <span>INVESTMENT PLAN</span>
          <h2>{plan.name}</h2>
        </div>
      </div>

      <p className="premium-plan-description">
        {plan.description}
      </p>

      <div className="premium-return-box">
        <div>
          <span>PROJECTED RETURN</span>

          <strong>
            {plan.returnRate}
            <small>%</small>
          </strong>
        </div>

        <div className="return-period">
          <span>TERM</span>
          <strong>{plan.duration} Days</strong>
        </div>
      </div>

      <div className="premium-plan-details">
        <div className="premium-detail-row">
          <span>Minimum investment</span>
          <strong>${plan.min.toLocaleString()}</strong>
        </div>

        <div className="premium-detail-row">
          <span>Maximum investment</span>
          <strong>${plan.max.toLocaleString()}</strong>
        </div>

        <div className="premium-detail-row">
          <span>Investment period</span>
          <strong>{plan.duration} days</strong>
        </div>
      </div>

      <div className="premium-plan-footer">
        <div className="plan-growth-indicator">
          <span className="growth-dot"></span>
          Portfolio opportunity
        </div>

        <button
          className={`premium-invest-button ${
            plan.popular ? "featured-invest-button" : ""
          }`}
          onClick={onSelect}
        >
          View Plan
          <span>→</span>
        </button>
      </div>
    </article>
  );
}


/* =========================================================
   INVESTMENT MODAL
========================================================= */

function InvestmentModal({ plan, onClose, onInvest }) {
  const [amount, setAmount] = useState("");

  const numericAmount = Number(amount) || 0;

  const projectedProfit =
    numericAmount * (plan.returnRate / 100);

  const projectedTotal =
    numericAmount + projectedProfit;

  const isValid =
    numericAmount >= plan.min &&
    numericAmount <= plan.max;

  const formattedAmount =
    numericAmount > 0 ? formatMoney(numericAmount) : "0.00";

  const formattedProfit =
    numericAmount > 0 ? formatMoney(projectedProfit) : "0.00";

  const formattedTotal =
    numericAmount > 0 ? formatMoney(projectedTotal) : "0.00";

  const handleSubmit = () => {
    if (!isValid) return;

    onInvest({
      plan,
      amount: numericAmount,
      projectedProfit,
      projectedTotal,
    });

    onClose();
  };

  return (
    <div
      className="premium-investment-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="premium-investment-modal">
        <button
          className="premium-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        {/* MODAL HEADER */}
        <div className="premium-modal-plan">
          <div className={`premium-modal-icon ${plan.id}`}>
            {plan.icon}
          </div>

          <div>
            <span>SELECTED PLAN</span>
            <h2>{plan.name} Plan</h2>
          </div>
        </div>

        <div className="modal-plan-summary">
          <div>
            <span>RETURN</span>
            <strong>
              {plan.returnRate}%
            </strong>
          </div>

          <div>
            <span>DURATION</span>
            <strong>
              {plan.duration} days
            </strong>
          </div>

          <div>
            <span>MINIMUM</span>
            <strong>
              ${plan.min.toLocaleString()}
            </strong>
          </div>
        </div>

        {/* AMOUNT */}
        <div className="premium-form-group">
          <label>How much would you like to invest?</label>

          <div className="premium-amount-input">
            <span>$</span>

            <input
              type="number"
              min={plan.min}
              max={plan.max}
              step="0.01"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
              placeholder="0.00"
              autoFocus
            />

            <small>USD</small>
          </div>

          <p className="premium-amount-range">
            Investment range:{" "}
            <strong>
              ${plan.min.toLocaleString()}
            </strong>{" "}
            —{" "}
            <strong>
              ${plan.max.toLocaleString()}
            </strong>
          </p>
        </div>

        {/* QUICK AMOUNTS */}
        <div className="quick-amount-section">
          <span>QUICK SELECT</span>

          <div className="quick-amounts">
            {[plan.min, Math.round((plan.min + plan.max) / 2), plan.max]
              .filter(
                (value, index, array) =>
                  array.indexOf(value) === index
              )
              .map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() =>
                    setAmount(String(value))
                  }
                >
                  ${value.toLocaleString()}
                </button>
              ))}
          </div>
        </div>

        {/* CALCULATION */}
        <div className="premium-calculation">
          <div className="calculation-heading">
            <span>ESTIMATED OUTCOME</span>
            <small>Based on selected plan</small>
          </div>

          <div className="premium-calculation-row">
            <span>Investment amount</span>
            <strong>
              ${formattedAmount}
            </strong>
          </div>

          <div className="premium-calculation-row profit-row">
            <span>
              Projected return ({plan.returnRate}%)
            </span>

            <strong>
              +${formattedProfit}
            </strong>
          </div>

          <div className="premium-total-row">
            <div>
              <span>Projected total</span>
              <small>
                After {plan.duration} days
              </small>
            </div>

            <strong>
              ${formattedTotal}
            </strong>
          </div>
        </div>

        {/* WARNING */}
        {!isValid && amount && (
          <div className="premium-validation-message">
            <span>!</span>

            <p>
              Please enter an amount between{" "}
              <strong>
                ${plan.min.toLocaleString()}
              </strong>{" "}
              and{" "}
              <strong>
                ${plan.max.toLocaleString()}
              </strong>
              .
            </p>
          </div>
        )}

        {/* ACTION */}
        <button
          className="premium-confirm-invest"
          disabled={!isValid}
          onClick={handleSubmit}
        >
          {isValid
            ? "Continue with Investment"
            : `Enter at least $${plan.min.toLocaleString()}`}
          <span>→</span>
        </button>

        <p className="premium-modal-disclaimer">
          By continuing, you acknowledge that projected returns are
          estimates and investment performance is not guaranteed.
        </p>
      </div>
    </div>
  );
}