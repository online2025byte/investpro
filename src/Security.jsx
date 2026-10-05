import React from "react";

function Security({ user, onBack, onLogout }) {
  return (
    <div className="security-page">

      <div className="security-page-header">

        <button
          type="button"
          className="security-back-button"
          onClick={onBack}
        >
          ←
        </button>

        <div>
          <h1>Security</h1>
          <p>Protect your InvestPro account</p>
        </div>

      </div>


      {/* ACCOUNT SECURITY STATUS */}

      <section className="security-status-card">

        <div className="security-status-icon">
          ✓
        </div>

        <div>
          <strong>
            Your account is protected
          </strong>

          <p>
            Your account uses Firebase Authentication
            to securely manage your login.
          </p>
        </div>

      </section>


      {/* LOGIN & PASSWORD */}

      <section className="security-section">

        <div className="security-section-title">
          ACCOUNT SECURITY
        </div>


        <div className="security-option">

          <div className="security-option-icon">
            🔐
          </div>

          <div className="security-option-content">

            <strong>
              Password
            </strong>

            <span>
              Change your account password
            </span>

          </div>

          <button
            type="button"
            className="security-option-button"
            onClick={() =>
              alert(
                "Password reset will be available here."
              )
            }
          >
            Change
          </button>

        </div>


        <div className="security-option">

          <div className="security-option-icon">
            ✉
          </div>

          <div className="security-option-content">

            <strong>
              Email Address
            </strong>

            <span>
              {user?.email || "No email available"}
            </span>

          </div>

          <span className="security-verified">
            Verified
          </span>

        </div>

      </section>


      {/* EXTRA SECURITY */}

      <section className="security-section">

        <div className="security-section-title">
          EXTRA PROTECTION
        </div>


        <div className="security-option">

          <div className="security-option-icon">
            ✓
          </div>

          <div className="security-option-content">

            <strong>
              Two-factor authentication
            </strong>

            <span>
              Add an extra layer of protection
            </span>

          </div>

          <span className="security-coming-soon">
            Coming soon
          </span>

        </div>

      </section>


      {/* SECURITY TIPS */}

      <section className="security-tips">

        <div className="security-tips-title">
          Security tips
        </div>

        <ul>

          <li>
            Never share your password with anyone.
          </li>

          <li>
            Use a strong and unique password.
          </li>

          <li>
            Always log out on shared devices.
          </li>

          <li>
            Contact support if you notice unusual
            activity on your account.
          </li>

        </ul>

      </section>


      {/* LOGOUT */}

      <button
        type="button"
        className="security-logout-button"
        onClick={onLogout}
      >
        ↪ &nbsp; Log out of InvestPro
      </button>

    </div>
  );
}

export default Security;