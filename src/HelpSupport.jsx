import React from "react";

function HelpSupport({ onBack }) {
  return (
    <div className="support-page">

      <div className="support-page-header">

        <button
          type="button"
          className="support-back-button"
          onClick={onBack}
        >
          ←
        </button>

        <div>
          <h1>Help & Support</h1>
          <p>We're here to help</p>
        </div>

      </div>


      {/* SUPPORT HERO */}

      <section className="support-hero">

        <div className="support-hero-icon">
          ?
        </div>

        <div>

          <h2>
            How can we help?
          </h2>

          <p>
            Find answers to common questions or
            contact our support team.
          </p>

        </div>

      </section>


      {/* SUPPORT OPTIONS */}

      <section className="support-section">

        <div className="support-section-title">
          GET HELP
        </div>


        <button
          type="button"
          className="support-option"
          onClick={() =>
            alert(
              "Live support will be available here."
            )
          }
        >

          <div className="support-option-icon">
            💬
          </div>

          <div className="support-option-content">

            <strong>
              Contact Support
            </strong>

            <span>
              Get help from our support team
            </span>

          </div>

          <span className="support-arrow">
            →
          </span>

        </button>


        <button
          type="button"
          className="support-option"
          onClick={() =>
            alert(
              "Frequently asked questions will be available here."
            )
          }
        >

          <div className="support-option-icon">
            ?
          </div>

          <div className="support-option-content">

            <strong>
              Frequently Asked Questions
            </strong>

            <span>
              Find answers to common questions
            </span>

          </div>

          <span className="support-arrow">
            →
          </span>

        </button>


        <button
          type="button"
          className="support-option"
          onClick={() =>
            alert(
              "The investment guide will be available here."
            )
          }
        >

          <div className="support-option-icon">
            ◈
          </div>

          <div className="support-option-content">

            <strong>
              Investment Guide
            </strong>

            <span>
              Learn how InvestPro works
            </span>

          </div>

          <span className="support-arrow">
            →
          </span>

        </button>

      </section>


      {/* COMMON QUESTIONS */}

      <section className="support-faq">

        <div className="support-section-title">
          QUICK ANSWERS
        </div>

        <div className="support-faq-card">

          <strong>
            How do I make an investment?
          </strong>

          <p>
            Open the Invest section from your
            dashboard, choose an available plan,
            enter your amount and submit your
            investment request.
          </p>

        </div>


        <div className="support-faq-card">

          <strong>
            Where can I see my investments?
          </strong>

          <p>
            Open My Investments from the navigation
            menu to view your investment requests
            and their current status.
          </p>

        </div>


        <div className="support-faq-card">

          <strong>
            How do I manage my balance?
          </strong>

          <p>
            Your Wallet section contains your
            available balance and wallet-related
            information.
          </p>

        </div>

      </section>


      {/* FOOTER */}

      <div className="support-footer">
        InvestPro Support
      </div>

    </div>
  );
}

export default HelpSupport;