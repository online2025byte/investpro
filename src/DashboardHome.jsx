import React from "react";


function formatMoney(value) {
  const amount = Number(value || 0);

  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}


function DashboardHome({
  user,
  userData,
  onNavigate,
}) {

  const name =
    userData?.name ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Investor";


  const balance = Number(
    userData?.balance || 0
  );

  const totalInvested = Number(
    userData?.totalInvested || 0
  );

  const totalProfit = Number(
    userData?.totalProfit || 0
  );

  const activeInvestments = Number(
    userData?.activeInvestments || 0
  );


  return (
    <div className="dashboard-home">


      {/* =====================================
          PAGE INTRO
      ====================================== */}

      <section className="dashboard-intro">

        <div>

          <span className="eyebrow">
            OVERVIEW
          </span>

          <h1>
            Welcome back, {name.split(" ")[0]}.
          </h1>

          <p>
            Here's what's happening with
            your investment portfolio today.
          </p>

        </div>


        <button
          className="header-invest-button"
          onClick={() =>
            onNavigate("investments")
          }
        >
          <span>＋</span>
          New Investment
        </button>

      </section>


      {/* =====================================
          BALANCE / PORTFOLIO HERO
      ====================================== */}

      <section className="portfolio-hero">


        <div className="portfolio-left">

          <div className="portfolio-title-row">

            <span>
              Total Balance
            </span>

            <button
              className="balance-eye"
              type="button"
            >
              ◉
            </button>

          </div>


          <h2>
            $
            {formatMoney(balance)}
          </h2>


          <div className="portfolio-status">

            <span className="status-dot"></span>

            <span>
              Account active
            </span>

          </div>


          <div className="portfolio-actions">

            <button
              onClick={() =>
                onNavigate("wallet")
              }
              className="portfolio-action primary"
            >
              <span className="action-symbol">
                ↓
              </span>

              <span>
                Deposit
              </span>
            </button>


            <button
              onClick={() =>
                onNavigate("investments")
              }
              className="portfolio-action"
            >
              <span className="action-symbol">
                +
              </span>

              <span>
                Invest
              </span>
            </button>


            <button
              onClick={() =>
                onNavigate("wallet")
              }
              className="portfolio-action"
            >
              <span className="action-symbol">
                ↑
              </span>

              <span>
                Withdraw
              </span>
            </button>

          </div>

        </div>


        <div className="portfolio-chart-area">

          <div className="chart-label">
            Portfolio overview
          </div>


          <div className="big-chart">

            <div className="chart-grid-line one"></div>
            <div className="chart-grid-line two"></div>
            <div className="chart-grid-line three"></div>


            <svg
              viewBox="0 0 600 250"
              preserveAspectRatio="none"
            >

              <defs>

                <linearGradient
                  id="portfolioGradient"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >

                  <stop
                    offset="0%"
                    stopColor="#ffffff"
                    stopOpacity="0.24"
                  />

                  <stop
                    offset="100%"
                    stopColor="#ffffff"
                    stopOpacity="0"
                  />

                </linearGradient>

              </defs>


              <path
                d="M0 210
                   C40 190 60 195 95 170
                   C125 148 140 175 170 145
                   C205 110 230 135 260 112
                   C300 80 315 115 350 90
                   C390 60 410 92 445 55
                   C475 30 510 50 540 35
                   C565 22 585 25 600 8
                   L600 250
                   L0 250 Z"
                fill="url(#portfolioGradient)"
              />


              <path
                d="M0 210
                   C40 190 60 195 95 170
                   C125 148 140 175 170 145
                   C205 110 230 135 260 112
                   C300 80 315 115 350 90
                   C390 60 410 92 445 55
                   C475 30 510 50 540 35
                   C565 22 585 25 600 8"
                fill="none"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="4"
                strokeLinecap="round"
              />

            </svg>

          </div>


          <div className="chart-periods">

            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>

          </div>

        </div>

      </section>


      {/* =====================================
          STATISTICS
      ====================================== */}

      <section className="stats-grid">


        <div className="modern-stat-card">

          <div className="stat-card-top">

            <div className="stat-icon">
              $
            </div>

            <span className="stat-positive">
              Portfolio
            </span>

          </div>

          <p>
            Total Invested
          </p>

          <h3>
            ${formatMoney(totalInvested)}
          </h3>

          <span className="stat-description">
            Capital currently invested
          </span>

        </div>


        <div className="modern-stat-card">

          <div className="stat-card-top">

            <div className="stat-icon profit-icon">
              ↗
            </div>

            <span className="stat-positive">
              Performance
            </span>

          </div>

          <p>
            Total Profit
          </p>

          <h3>
            ${formatMoney(totalProfit)}
          </h3>

          <span className="stat-description">
            Recorded investment returns
          </span>

        </div>


        <div className="modern-stat-card">

          <div className="stat-card-top">

            <div className="stat-icon active-icon">
              ◈
            </div>

            <span className="stat-positive">
              Active
            </span>

          </div>

          <p>
            Active Investments
          </p>

          <h3>
            {activeInvestments}
          </h3>

          <span className="stat-description">
            Current investment positions
          </span>

        </div>


        <div className="modern-stat-card">

          <div className="stat-card-top">

            <div className="stat-icon wallet-icon">
              ₿
            </div>

            <span className="stat-positive">
              Available
            </span>

          </div>

          <p>
            Available Balance
          </p>

          <h3>
            ${formatMoney(balance)}
          </h3>

          <span className="stat-description">
            Available account balance
          </span>

        </div>

      </section>


      {/* =====================================
          QUICK ACTIONS
      ====================================== */}

      <section className="quick-actions-section">

        <div className="section-heading">

          <div>

            <span className="eyebrow">
              QUICK ACTIONS
            </span>

            <h2>
              Manage your account
            </h2>

          </div>

        </div>


        <div className="quick-actions-grid">


          <button
            className="quick-action-card"
            onClick={() =>
              onNavigate("wallet")
            }
          >

            <div className="quick-action-icon deposit">
              ↓
            </div>

            <div>

              <strong>
                Add Funds
              </strong>

              <span>
                Deposit money into your wallet
              </span>

            </div>

            <b>
              →
            </b>

          </button>


          <button
            className="quick-action-card"
            onClick={() =>
              onNavigate("investments")
            }
          >

            <div className="quick-action-icon invest">
              +
            </div>

            <div>

              <strong>
                Start Investing
              </strong>

              <span>
                Explore available investment plans
              </span>

            </div>

            <b>
              →
            </b>

          </button>


          <button
            className="quick-action-card"
            onClick={() =>
              onNavigate("my-investments")
            }
          >

            <div className="quick-action-icon portfolio">
              ◈
            </div>

            <div>

              <strong>
                View Portfolio
              </strong>

              <span>
                Review your current investments
              </span>

            </div>

            <b>
              →
            </b>

          </button>


          <button
            className="quick-action-card"
            onClick={() =>
              onNavigate("wallet")
            }
          >

            <div className="quick-action-icon withdraw">
              ↑
            </div>

            <div>

              <strong>
                Withdraw
              </strong>

              <span>
                Manage your available funds
              </span>

            </div>

            <b>
              →
            </b>

          </button>

        </div>

      </section>


      {/* =====================================
          INVESTMENT PLANS
      ====================================== */}

      <section className="investment-section">


        <div className="section-heading">

          <div>

            <span className="eyebrow">
              INVESTMENT OPPORTUNITIES
            </span>

            <h2>
              Choose your strategy
            </h2>

            <p>
              Explore plans available on
              your account.
            </p>

          </div>


          <button
            className="view-all-button"
            onClick={() =>
              onNavigate("investments")
            }
          >
            View all
            <span>→</span>
          </button>

        </div>


        <div className="premium-plans-grid">


          <div className="premium-plan-card">

            <div className="plan-top">

              <div className="plan-round-icon starter">
                ✦
              </div>

              <span>
                30 DAYS
              </span>

            </div>


            <h3>
              Starter
            </h3>

            <p>
              A simple entry point for
              new investors.
            </p>


            <div className="plan-return-row">

              <div>

                <small>
                  Return
                </small>

                <strong>
                  150%
                </strong>

              </div>


              <div>

                <small>
                  Duration
                </small>

                <strong>
                  30 days
                </strong>

              </div>

            </div>


            <button
              onClick={() =>
                onNavigate("investments")
              }
            >
              Explore plan
              <span>→</span>
            </button>

          </div>


          <div className="premium-plan-card featured">


            <div className="featured-label">
              MOST POPULAR
            </div>


            <div className="plan-top">

              <div className="plan-round-icon growth">
                ↗
              </div>

              <span>
                60 DAYS
              </span>

            </div>


            <h3>
              Growth
            </h3>

            <p>
              Designed for investors seeking
              a longer investment period.
            </p>


            <div className="plan-return-row">

              <div>

                <small>
                  Return
                </small>

                <strong>
                  250%
                </strong>

              </div>


              <div>

                <small>
                  Duration
                </small>

                <strong>
                  60 days
                </strong>

              </div>

            </div>


            <button
              onClick={() =>
                onNavigate("investments")
              }
            >
              Explore plan
              <span>→</span>
            </button>

          </div>


          <div className="premium-plan-card">

            <div className="plan-top">

              <div className="plan-round-icon premium">
                ◆
              </div>

              <span>
                90 DAYS
              </span>

            </div>


            <h3>
              Premium
            </h3>

            <p>
              A longer-term option for
              experienced investors.
            </p>


            <div className="plan-return-row">

              <div>

                <small>
                  Return
                </small>

                <strong>
                  350%
                </strong>

              </div>


              <div>

                <small>
                  Duration
                </small>

                <strong>
                  90 days
                </strong>

              </div>

            </div>


            <button
              onClick={() =>
                onNavigate("investments")
              }
            >
              Explore plan
              <span>→</span>
            </button>

          </div>

        </div>

      </section>


      {/* =====================================
          ACCOUNT NOTICE
      ====================================== */}

      <section className="dashboard-notice">

        <div className="notice-icon">
          i
        </div>

        <div>

          <strong>
            Keep your account information
            up to date
          </strong>

          <p>
            Make sure your account details
            are accurate before making
            deposits or withdrawals.
          </p>

        </div>

      </section>


      {/* =====================================
          DASHBOARD FOOTER
      ====================================== */}

      <footer className="dashboard-footer">

        <span>
          InvestPro
        </span>

        <span>
          Your investment dashboard
        </span>

      </footer>

    </div>
  );
}


export default DashboardHome;