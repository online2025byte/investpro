import React from "react";


function BottomNav({
  page,
  onNavigate,
}) {

  const items = [

    {
      id: "dashboard",
      icon: "⌂",
      label: "Home",
    },

    {
      id: "investments",
      icon: "◈",
      label: "Invest",
    },

    {
      id: "my-investments",
      icon: "▣",
      label: "Portfolio",
    },

    {
      id: "wallet",
      icon: "₿",
      label: "Wallet",
    },

  ];


  return (
    <nav className="bottom-nav">

      {items.map((item) => (

        <button
          key={item.id}
          className={
            page === item.id
              ? "bottom-nav-item active"
              : "bottom-nav-item"
          }
          onClick={() =>
            onNavigate(item.id)
          }
        >

          <span className="bottom-icon">
            {item.icon}
          </span>

          <span>
            {item.label}
          </span>

        </button>

      ))}

    </nav>
  );
}


export default BottomNav;