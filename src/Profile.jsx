import React from "react";

function Profile({ user, userData, onBack, onLogout }) {
  const name =
    userData?.name ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Investor";

  const email = user?.email || "No email available";

  const initial = name
    .charAt(0)
    .toUpperCase();

  return (
    <div className="profile-page">

      {/* HEADER */}

      <div className="profile-page-header">

        <button
          type="button"
          className="profile-back-button"
          onClick={onBack}
        >
          ←
        </button>

        <div>
          <h1>Profile</h1>
          <p>Manage your account information</p>
        </div>

      </div>


      {/* PROFILE CARD */}

      <section className="profile-card">

        <div className="profile-avatar-large">
          {initial}
        </div>

        <div className="profile-main-info">

          <h2>{name}</h2>

          <p>{email}</p>

          <span className="profile-status">
            ● Active account
          </span>

        </div>

      </section>


      {/* ACCOUNT INFORMATION */}

      <section className="profile-section">

        <div className="profile-section-title">
          <span>ACCOUNT INFORMATION</span>
        </div>


        <div className="profile-info-list">

          <div className="profile-info-row">

            <div className="profile-info-icon">
              ◉
            </div>

            <div className="profile-info-content">

              <small>
                Full Name
              </small>

              <strong>
                {name}
              </strong>

            </div>

          </div>


          <div className="profile-info-row">

            <div className="profile-info-icon">
              @
            </div>

            <div className="profile-info-content">

              <small>
                Email Address
              </small>

              <strong>
                {email}
              </strong>

            </div>

          </div>


          <div className="profile-info-row">

            <div className="profile-info-icon">
              #
            </div>

            <div className="profile-info-content">

              <small>
                Account ID
              </small>

              <strong className="profile-user-id">
                {user?.uid || "Unavailable"}
              </strong>

            </div>

          </div>


          <div className="profile-info-row">

            <div className="profile-info-icon">
              ✓
            </div>

            <div className="profile-info-content">

              <small>
                Account Status
              </small>

              <strong className="profile-active-text">
                Active
              </strong>

            </div>

          </div>

        </div>

      </section>


      {/* SECURITY */}

      <section className="profile-section">

        <div className="profile-section-title">
          <span>SECURITY</span>
        </div>

        <button
          type="button"
          className="profile-action-row"
        >

          <div className="profile-info-icon">
            ◇
          </div>

          <div className="profile-info-content">

            <strong>
              Password & Security
            </strong>

            <small>
              Manage your account security
            </small>

          </div>

          <span className="profile-action-arrow">
            →
          </span>

        </button>

      </section>


      {/* LOGOUT */}

      <button
        type="button"
        className="profile-logout-button"
        onClick={onLogout}
      >
        <span>
          ↪
        </span>

        Log out of InvestPro
      </button>

    </div>
  );
}

export default Profile;