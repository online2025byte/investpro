import React from "react";


function SideMenu({
  page,
  user,
  userData,
  onNavigate,
  onLogout,
}) {

  const name =
    userData?.name ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Investor";


  const email =
    user?.email ||
    "";


  const menuItems = [

    {
      id: "dashboard",
      icon: "⌂",
      label: "Dashboard",
    },

    {
      id: "investments",
      icon: "◈",
      label: "Invest",
    },

    {
      id: "my-investments",
      icon: "▣",
      label: "My Investments",
    },

    {
      id: "wallet",
      icon: "₿",
      label: "Wallet",
    },

  ];


  return (
    <aside className="side-menu">


      {/* ====================================
          BRAND
      ===================================== */}

      <div className="side-brand">

        <div className="brand-mark">
          ₿
        </div>

        <div>

          <strong>
            Invest<span>Pro</span>
          </strong>

          <small>
            INVESTMENT PLATFORM
          </small>

        </div>

      </div>


      {/* ====================================
          MENU
      ===================================== */}

      <div className="side-menu-label">
        MAIN MENU
      </div>


      <nav className="side-navigation">

        {menuItems.map((item) => (

          <button
            key={item.id}
            className={
              page === item.id
                ? "side-nav-item active"
                : "side-nav-item"
            }
            onClick={() =>
              onNavigate(item.id)
            }
          >

            <span className="side-nav-icon">
              {item.icon}
            </span>

            <span>
              {item.label}
            </span>

            {page === item.id && (
              <i className="active-indicator"></i>
            )}

          </button>

        ))}


        {/* ADMIN */}

        {userData?.role === "admin" && (

          <>

            <div className="side-menu-label admin-label">
              MANAGEMENT
            </div>

            <button
              className={
                page === "admin"
                  ? "side-nav-item active admin-nav"
                  : "side-nav-item admin-nav"
              }
              onClick={() =>
                onNavigate("admin")
              }
            >

              <span className="side-nav-icon">
                ◆
              </span>

              <span>
                Admin Dashboard
              </span>

              {page === "admin" && (
                <i className="active-indicator"></i>
              )}

            </button>

          </>

        )}

      </nav>


      {/* ====================================
          LOWER AREA
      ===================================== */}

      <div className="side-bottom">


        <div className="side-help-card">

          <div className="help-icon">
            ?
          </div>

          <div>

            <strong>
              Need help?
            </strong>

            <span>
              We're here for you.
            </span>

          </div>

        </div>


        {/* ==================================
            USER CARD
        =================================== */}

        <div className="side-user">

          <div className="side-avatar">

            {name
              .charAt(0)
              .toUpperCase()}

          </div>


          <div className="side-user-info">

            <strong>
              {name}
            </strong>

            <span>
              {email}
            </span>

          </div>


          <button
            className="side-logout"
            onClick={onLogout}
            title="Logout"
          >
            ↪
          </button>

        </div>

      </div>

    </aside>
  );
}


export default SideMenu;