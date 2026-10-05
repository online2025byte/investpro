import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  runTransaction,
} from "firebase/firestore";
import { db } from "./firebase";

export default function AdminDashboard({ user, onBack }) {
  const [users, setUsers] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [investments, setInvestments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [activeTab, setActiveTab] = useState("deposits");

  const [selectedDeposit, setSelectedDeposit] =
    useState(null);

  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState(null);

  // =========================
  // LOAD ADMIN DATA
  // =========================

  useEffect(() => {
    const unsubUsers = onSnapshot(
      query(collection(db, "users")),
      (snapshot) => {
        setUsers(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
        );
      },
      (error) => {
        console.error("Users error:", error);
      }
    );

    const unsubDeposits = onSnapshot(
      query(
        collection(db, "depositRequests"),
        orderBy("createdAt", "desc")
      ),
      (snapshot) => {
        setDeposits(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
        );
      },
      (error) => {
        console.error("Deposits error:", error);
      }
    );

    const unsubWithdrawals = onSnapshot(
      query(
        collection(db, "withdrawalRequests"),
        orderBy("createdAt", "desc")
      ),
      (snapshot) => {
        setWithdrawals(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
        );
      },
      (error) => {
        console.error(
          "Withdrawals error:",
          error
        );
      }
    );

    const unsubInvestments = onSnapshot(
      query(
        collection(db, "investments"),
        orderBy("createdAt", "desc")
      ),
      (snapshot) => {
        setInvestments(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
        );

        setLoading(false);
      },
      (error) => {
        console.error(
          "Investments error:",
          error
        );

        setLoading(false);
      }
    );

    return () => {
      unsubUsers();
      unsubDeposits();
      unsubWithdrawals();
      unsubInvestments();
    };
  }, []);

  // =========================
  // FORMAT MONEY
  // =========================

  const formatMoney = (amount) =>
    Number(amount || 0).toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  // =========================
  // FORMAT CRYPTO
  // =========================

  const formatCryptoAmount = (amount) =>
    Number(amount || 0).toLocaleString(
      "en-US",
      {
        maximumFractionDigits: 12,
      }
    );

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) {
      return "Pending";
    }

    return timestamp
      .toDate()
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
  };

  // =========================
  // DEPOSIT DATA
  // =========================

  const pendingDeposits = useMemo(
    () =>
      deposits.filter(
        (deposit) =>
          deposit.status === "pending"
      ),
    [deposits]
  );

  const approvedDeposits = useMemo(
    () =>
      deposits.filter(
        (deposit) =>
          deposit.status === "approved"
      ),
    [deposits]
  );

  const totalDeposited = useMemo(
    () =>
      approvedDeposits.reduce(
        (total, deposit) =>
          total +
          Number(deposit.amount || 0),
        0
      ),
    [approvedDeposits]
  );

  // =========================
  // WITHDRAWAL DATA
  // =========================

  const pendingWithdrawals = useMemo(
    () =>
      withdrawals.filter(
        (withdrawal) =>
          withdrawal.status === "pending"
      ),
    [withdrawals]
  );

  const approvedWithdrawals = useMemo(
    () =>
      withdrawals.filter(
        (withdrawal) =>
          withdrawal.status === "approved"
      ),
    [withdrawals]
  );

  const totalWithdrawn = useMemo(
    () =>
      approvedWithdrawals.reduce(
        (total, withdrawal) =>
          total +
          Number(withdrawal.amount || 0),
        0
      ),
    [approvedWithdrawals]
  );

  // =========================
  // INVESTMENT DATA
  // =========================

  const totalInvested = useMemo(
    () =>
      investments.reduce(
        (total, investment) =>
          total +
          Number(investment.amount || 0),
        0
      ),
    [investments]
  );

  // =========================
  // APPROVE / REJECT DEPOSIT
  // =========================

  const handleDepositAction = async (
    deposit,
    action
  ) => {
    if (deposit.status !== "pending") {
      return;
    }

    const amount = Number(
      deposit.amount || 0
    );

    const message =
      action === "approved"
        ? `Approve this $${amount.toFixed(
            2
          )} crypto deposit?\n\nOnly approve after you have verified the transaction on the correct blockchain network.`
        : "Reject this crypto deposit request?";

    if (!window.confirm(message)) {
      return;
    }

    try {
      setProcessingId(deposit.id);

      const depositRef = doc(
        db,
        "depositRequests",
        deposit.id
      );

      const userRef = doc(
        db,
        "users",
        deposit.userId
      );

      await runTransaction(
        db,
        async (transaction) => {
          const depositSnap =
            await transaction.get(
              depositRef
            );

          if (!depositSnap.exists()) {
            throw new Error(
              "Deposit request no longer exists."
            );
          }

          const currentDeposit =
            depositSnap.data();

          if (
            currentDeposit.status !==
            "pending"
          ) {
            throw new Error(
              "This deposit has already been processed."
            );
          }

          // =========================
          // REJECT
          // =========================

          if (action === "rejected") {
            transaction.update(
              depositRef,
              {
                status: "rejected",
                processedAt:
                  new Date(),
              }
            );

            return;
          }

          // =========================
          // APPROVE
          // =========================

          if (
            !Number.isFinite(amount) ||
            amount <= 0
          ) {
            throw new Error(
              "Invalid deposit amount."
            );
          }

          const userSnap =
            await transaction.get(
              userRef
            );

          if (!userSnap.exists()) {
            throw new Error(
              "User account was not found."
            );
          }

          const currentUser =
            userSnap.data();

          const currentBalance =
            Number(
              currentUser.balance || 0
            );

          const newBalance =
            currentBalance + amount;

          transaction.update(
            userRef,
            {
              balance: newBalance,
            }
          );

          transaction.update(
            depositRef,
            {
              status: "approved",
              processedAt:
                new Date(),
            }
          );
        }
      );

      setSelectedDeposit(null);

      if (action === "approved") {
        alert(
          "Deposit approved successfully.\n\nThe user's balance has been updated."
        );
      } else {
        alert(
          "Deposit rejected successfully."
        );
      }
    } catch (error) {
      console.error(
        "Deposit action error:",
        error
      );

      alert(
        error.message ||
          "The deposit action could not be completed."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =========================
  // APPROVE / REJECT WITHDRAWAL
  // =========================

  const handleWithdrawalAction = async (
    withdrawal,
    action
  ) => {
    if (
      withdrawal.status !== "pending"
    ) {
      return;
    }

    const amount = Number(
      withdrawal.amount || 0
    );

    const message =
      action === "approved"
        ? `Approve this $${amount.toFixed(
            2
          )} crypto withdrawal?\n\nMake sure you have sent the crypto to the user's destination address before approving.`
        : "Reject this crypto withdrawal request?";

    if (!window.confirm(message)) {
      return;
    }

    try {
      setProcessingId(withdrawal.id);

      const withdrawalRef = doc(
        db,
        "withdrawalRequests",
        withdrawal.id
      );

      const userRef = doc(
        db,
        "users",
        withdrawal.userId
      );

      await runTransaction(
        db,
        async (transaction) => {
          const withdrawalSnap =
            await transaction.get(
              withdrawalRef
            );

          if (!withdrawalSnap.exists()) {
            throw new Error(
              "Withdrawal request no longer exists."
            );
          }

          const currentWithdrawal =
            withdrawalSnap.data();

          if (
            currentWithdrawal.status !==
            "pending"
          ) {
            throw new Error(
              "This withdrawal has already been processed."
            );
          }

          // =========================
          // REJECT
          // =========================

          if (action === "rejected") {
            transaction.update(
              withdrawalRef,
              {
                status: "rejected",
                processedAt:
                  new Date(),
              }
            );

            return;
          }

          // =========================
          // APPROVE
          // =========================

          if (
            !Number.isFinite(amount) ||
            amount <= 0
          ) {
            throw new Error(
              "Invalid withdrawal amount."
            );
          }

          const userSnap =
            await transaction.get(
              userRef
            );

          if (!userSnap.exists()) {
            throw new Error(
              "User account was not found."
            );
          }

          const currentUser =
            userSnap.data();

          const currentBalance =
            Number(
              currentUser.balance || 0
            );

          // =========================
          // BALANCE PROTECTION
          // =========================

          if (
            currentBalance < amount
          ) {
            throw new Error(
              `Insufficient user balance.\n\nCurrent balance: $${formatMoney(
                currentBalance
              )}\nWithdrawal requested: $${formatMoney(
                amount
              )}`
            );
          }

          const newBalance =
            currentBalance - amount;

          // Deduct only after approval.
          transaction.update(
            userRef,
            {
              balance: newBalance,
            }
          );

          transaction.update(
            withdrawalRef,
            {
              status: "approved",
              processedAt:
                new Date(),
            }
          );
        }
      );

      setSelectedWithdrawal(null);

      if (action === "approved") {
        alert(
          "Withdrawal approved successfully.\n\nThe withdrawal amount has been deducted from the user's balance."
        );
      } else {
        alert(
          "Withdrawal rejected successfully."
        );
      }
    } catch (error) {
      console.error(
        "Withdrawal action error:",
        error
      );

      alert(
        error.message ||
          "The withdrawal action could not be completed."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =========================
  // COPY TEXT
  // =========================

  const copyText = async (
    value,
    successMessage
  ) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(
        value
      );

      alert(
        successMessage ||
          "Copied successfully."
      );
    } catch (error) {
      console.error(
        "Copy error:",
        error
      );

      alert(
        "Unable to copy. Please copy it manually."
      );
    }
  };

  return (
    <div className="admin-page premium-admin-page">

      {/* =========================
          TOP BAR
      ========================= */}

      <header className="admin-topbar">

        <div className="admin-brand">

          <div className="admin-brand-mark">
            ₿
          </div>

          <div>
            <strong>
              InvestPro
            </strong>

            <span>
              Administration
            </span>
          </div>

        </div>

        <button
          className="admin-dashboard-btn"
          onClick={onBack}
        >
          <span>←</span>
          Dashboard
        </button>

      </header>

      {/* =========================
          MAIN
      ========================= */}

      <main className="premium-admin-container">

        {/* HEADER */}

        <section className="admin-welcome">

          <div>

            <span className="admin-eyebrow">
              ADMINISTRATION
            </span>

            <h1>
              Control Center
            </h1>

            <p>
              Monitor your platform, review crypto
              deposits and withdrawals, and manage
              investment activity.
            </p>

          </div>

          <div className="admin-online">

            <span className="admin-online-dot" />

            System Online

          </div>

        </section>

        {/* =========================
            STAT CARDS
        ========================= */}

        <section className="premium-admin-stats">

          <div className="premium-admin-stat">

            <div className="admin-stat-icon users-icon">
              👥
            </div>

            <div>
              <span>
                Total Users
              </span>

              <strong>
                {users.length}
              </strong>

              <small>
                Registered accounts
              </small>
            </div>

          </div>

          <div className="premium-admin-stat">

            <div className="admin-stat-icon deposit-icon">
              $
            </div>

            <div>
              <span>
                Pending Deposits
              </span>

              <strong>
                {pendingDeposits.length}
              </strong>

              <small>
                Awaiting review
              </small>
            </div>

          </div>

          <div className="premium-admin-stat">

            <div className="admin-stat-icon investment-icon">
              ↓
            </div>

            <div>
              <span>
                Pending Withdrawals
              </span>

              <strong>
                {pendingWithdrawals.length}
              </strong>

              <small>
                Awaiting review
              </small>
            </div>

          </div>

          <div className="premium-admin-stat">

            <div className="admin-stat-icon money-icon">
              ₿
            </div>

            <div>
              <span>
                Platform Deposits
              </span>

              <strong>
                ${formatMoney(totalDeposited)}
              </strong>

              <small>
                Approved deposits
              </small>
            </div>

          </div>

        </section>

        {/* =========================
            PLATFORM OVERVIEW
        ========================= */}

        <section className="admin-overview-card">

          <div className="admin-overview-left">

            <div className="admin-overview-icon">
              ✦
            </div>

            <div>

              <span>
                PLATFORM OVERVIEW
              </span>

              <h2>
                ${formatMoney(totalInvested)}
              </h2>

              <p>
                Total investment volume recorded
                across the platform.
              </p>

            </div>

          </div>

          <div className="admin-overview-right">

            <div>
              <span>
                Approved Deposits
              </span>

              <strong>
                {approvedDeposits.length}
              </strong>
            </div>

            <div>
              <span>
                Approved Withdrawals
              </span>

              <strong>
                {approvedWithdrawals.length}
              </strong>
            </div>

            <div>
              <span>
                Withdrawn
              </span>

              <strong>
                ${formatMoney(totalWithdrawn)}
              </strong>
            </div>

          </div>

        </section>

        {/* =========================
            MANAGEMENT AREA
        ========================= */}

        <section className="admin-management">

          <div className="admin-management-header">

            <div>

              <span className="admin-eyebrow">
                MANAGEMENT
              </span>

              <h2>
                Platform Activity
              </h2>

            </div>

            <div className="admin-tabs">

              <button
                className={
                  activeTab === "deposits"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab("deposits")
                }
              >
                Deposits

                {pendingDeposits.length >
                  0 && (
                  <b>
                    {pendingDeposits.length}
                  </b>
                )}
              </button>

              <button
                className={
                  activeTab === "withdrawals"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab(
                    "withdrawals"
                  )
                }
              >
                Withdrawals

                {pendingWithdrawals.length >
                  0 && (
                  <b>
                    {pendingWithdrawals.length}
                  </b>
                )}
              </button>

              <button
                className={
                  activeTab ===
                  "investments"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab(
                    "investments"
                  )
                }
              >
                Investments
              </button>

            </div>

          </div>

          {/* =========================
              DEPOSITS
          ========================= */}

          {activeTab === "deposits" && (

            <div className="admin-data-card">

              <div className="admin-data-heading">

                <div>

                  <h3>
                    Crypto Deposit Requests
                  </h3>

                  <p>
                    Verify blockchain details before
                    approving a deposit.
                  </p>

                </div>

                <div className="admin-count">
                  {deposits.length} total
                </div>

              </div>

              {loading ? (

                <div className="admin-loading-state">

                  <div className="admin-spinner" />

                  <span>
                    Loading deposit requests...
                  </span>

                </div>

              ) : deposits.length === 0 ? (

                <div className="admin-empty-state">

                  <div>
                    ₿
                  </div>

                  <h3>
                    No deposit requests
                  </h3>

                  <p>
                    New crypto deposit requests
                    will appear here.
                  </p>

                </div>

              ) : (

                <div className="admin-table-scroll">

                  <table className="premium-admin-table">

                    <thead>

                      <tr>

                        <th>
                          Deposit
                        </th>

                        <th>
                          Crypto
                        </th>

                        <th>
                          User
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Date
                        </th>

                        <th>
                          Action
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {deposits.map(
                        (deposit) => (

                          <tr
                            key={
                              deposit.id
                            }
                          >

                            <td>

                              <div className="admin-amount">

                                <div className="admin-row-icon">
                                  ₿
                                </div>

                                <div>

                                  <strong>
                                    $
                                    {formatMoney(
                                      deposit.amount
                                    )}
                                  </strong>

                                  <span>
                                    {formatCryptoAmount(
                                      deposit.cryptoAmount
                                    )}{" "}
                                    {deposit.currency ||
                                      "Crypto"}
                                  </span>

                                </div>

                              </div>

                            </td>

                            <td>

                              <span className="admin-method">

                                {deposit.currency ||
                                  "Crypto"}

                                {deposit.network
                                  ? ` · ${deposit.network}`
                                  : ""}

                              </span>

                            </td>

                            <td>

                              <div className="admin-user">

                                <div className="admin-user-avatar">

                                  {(
                                    deposit.userId ||
                                    "U"
                                  )
                                    .charAt(0)
                                    .toUpperCase()}

                                </div>

                                <div>

                                  <strong>
                                    User Account
                                  </strong>

                                  <span>
                                    {
                                      deposit.userId
                                    }
                                  </span>

                                </div>

                              </div>

                            </td>

                            <td>

                              <span
                                className={`admin-status admin-status-${deposit.status}`}
                              >

                                <i />

                                {deposit.status}

                              </span>

                            </td>

                            <td>

                              <span className="admin-date">
                                {formatDate(
                                  deposit.createdAt
                                )}
                              </span>

                            </td>

                            <td>

                              <button
                                type="button"
                                className="premium-approve"
                                onClick={() =>
                                  setSelectedDeposit(
                                    deposit
                                  )
                                }
                              >
                                Review
                              </button>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          )}

          {/* =========================
              WITHDRAWALS
          ========================= */}

          {activeTab === "withdrawals" && (

            <div className="admin-data-card">

              <div className="admin-data-heading">

                <div>

                  <h3>
                    Crypto Withdrawal Requests
                  </h3>

                  <p>
                    Verify the destination address
                    and process the user's withdrawal.
                  </p>

                </div>

                <div className="admin-count">
                  {withdrawals.length} total
                </div>

              </div>

              {loading ? (

                <div className="admin-loading-state">

                  <div className="admin-spinner" />

                  <span>
                    Loading withdrawal requests...
                  </span>

                </div>

              ) : withdrawals.length === 0 ? (

                <div className="admin-empty-state">

                  <div>
                    ↓
                  </div>

                  <h3>
                    No withdrawal requests
                  </h3>

                  <p>
                    New crypto withdrawal requests
                    will appear here.
                  </p>

                </div>

              ) : (

                <div className="admin-table-scroll">

                  <table className="premium-admin-table">

                    <thead>

                      <tr>

                        <th>
                          Withdrawal
                        </th>

                        <th>
                          Crypto
                        </th>

                        <th>
                          User
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Date
                        </th>

                        <th>
                          Action
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {withdrawals.map(
                        (withdrawal) => (

                          <tr
                            key={
                              withdrawal.id
                            }
                          >

                            <td>

                              <div className="admin-amount">

                                <div className="admin-row-icon">
                                  ↓
                                </div>

                                <div>

                                  <strong>
                                    $
                                    {formatMoney(
                                      withdrawal.amount
                                    )}
                                  </strong>

                                  <span>
                                    {formatCryptoAmount(
                                      withdrawal.cryptoAmount
                                    )}{" "}
                                    {withdrawal.currency ||
                                      "Crypto"}
                                  </span>

                                </div>

                              </div>

                            </td>

                            <td>

                              <span className="admin-method">

                                {withdrawal.currency ||
                                  "Crypto"}

                                {withdrawal.network
                                  ? ` · ${withdrawal.network}`
                                  : ""}

                              </span>

                            </td>

                            <td>

                              <div className="admin-user">

                                <div className="admin-user-avatar">

                                  {(
                                    withdrawal.userId ||
                                    "U"
                                  )
                                    .charAt(0)
                                    .toUpperCase()}

                                </div>

                                <div>

                                  <strong>
                                    User Account
                                  </strong>

                                  <span>
                                    {
                                      withdrawal.userId
                                    }
                                  </span>

                                </div>

                              </div>

                            </td>

                            <td>

                              <span
                                className={`admin-status admin-status-${withdrawal.status}`}
                              >

                                <i />

                                {withdrawal.status}

                              </span>

                            </td>

                            <td>

                              <span className="admin-date">
                                {formatDate(
                                  withdrawal.createdAt
                                )}
                              </span>

                            </td>

                            <td>

                              <button
                                type="button"
                                className="premium-approve"
                                onClick={() =>
                                  setSelectedWithdrawal(
                                    withdrawal
                                  )
                                }
                              >
                                Review
                              </button>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          )}

          {/* =========================
              INVESTMENTS
          ========================= */}

          {activeTab === "investments" && (

            <div className="admin-data-card">

              <div className="admin-data-heading">

                <div>

                  <h3>
                    Recent Investments
                  </h3>

                  <p>
                    View investment activity
                    across the platform.
                  </p>

                </div>

                <div className="admin-count">
                  {investments.length} total
                </div>

              </div>

              {investments.length === 0 ? (

                <div className="admin-empty-state">

                  <div>
                    ↗
                  </div>

                  <h3>
                    No investments yet
                  </h3>

                  <p>
                    Investment records will
                    appear here.
                  </p>

                </div>

              ) : (

                <div className="admin-table-scroll">

                  <table className="premium-admin-table">

                    <thead>

                      <tr>
                        <th>
                          Investment
                        </th>

                        <th>
                          Amount
                        </th>

                        <th>
                          User
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Date
                        </th>
                      </tr>

                    </thead>

                    <tbody>

                      {investments.map(
                        (investment) => (

                          <tr
                            key={
                              investment.id
                            }
                          >

                            <td>

                              <div className="admin-investment">

                                <div className="investment-plan-icon">
                                  {investment.planIcon ||
                                    "◆"}
                                </div>

                                <div>

                                  <strong>
                                    {investment.planName ||
                                      "Investment Plan"}
                                  </strong>

                                  <span>
                                    {investment.duration ||
                                      "—"}{" "}
                                    days
                                  </span>

                                </div>

                              </div>

                            </td>

                            <td>

                              <strong className="admin-investment-amount">
                                $
                                {formatMoney(
                                  investment.amount
                                )}
                              </strong>

                            </td>

                            <td>

                              <div className="admin-user">

                                <div className="admin-user-avatar">

                                  {(
                                    investment.userId ||
                                    "U"
                                  )
                                    .charAt(0)
                                    .toUpperCase()}

                                </div>

                                <div>

                                  <strong>
                                    User Account
                                  </strong>

                                  <span>
                                    {
                                      investment.userId
                                    }
                                  </span>

                                </div>

                              </div>

                            </td>

                            <td>

                              <span
                                className={`admin-status admin-investment-status-${investment.status}`}
                              >

                                <i />

                                {investment.status}

                              </span>

                            </td>

                            <td>

                              <span className="admin-date">
                                {formatDate(
                                  investment.createdAt
                                )}
                              </span>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          )}

        </section>

        {/* =========================
            ADMIN SECURITY NOTICE
        ========================= */}

        <section className="admin-security">

          <div className="admin-security-icon">
            ✓
          </div>

          <div>

            <strong>
              Secure Administration
            </strong>

            <p>
              Financial actions use Firebase
              transactions to help prevent duplicate
              balance updates. Always verify crypto
              transfers before approval.
            </p>

          </div>

        </section>

      </main>

      {/* ==================================================
          DEPOSIT REVIEW MODAL
      ================================================== */}

      {selectedDeposit && (

        <div
          className="wallet-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedDeposit(null);
            }
          }}
        >

          <div className="wallet-deposit-modal admin-review-modal">

            <button
              className="wallet-modal-close"
              type="button"
              onClick={() =>
                setSelectedDeposit(null)
              }
              aria-label="Close"
            >
              ×
            </button>

            <div className="wallet-modal-header">

              <div className="wallet-modal-icon">
                ₿
              </div>

              <div>

                <span>
                  DEPOSIT VERIFICATION
                </span>

                <h2>
                  Review Crypto Deposit
                </h2>

              </div>

            </div>

            <p className="wallet-modal-description">
              Verify the transaction on the
              correct blockchain explorer before
              approving this deposit.
            </p>

            <div className="admin-review-amount">

              <span>
                Deposit Value
              </span>

              <strong>
                $
                {formatMoney(
                  selectedDeposit.amount
                )}
              </strong>

            </div>

            <div className="admin-review-details">

              <div className="admin-review-detail">

                <span>
                  Cryptocurrency
                </span>

                <strong>
                  {selectedDeposit.cryptoName ||
                    "Cryptocurrency"}{" "}
                  (
                  {selectedDeposit.currency ||
                    "Crypto"}
                  )
                </strong>

              </div>

              <div className="admin-review-detail">

                <span>
                  Network
                </span>

                <strong>
                  {selectedDeposit.network ||
                    "Not specified"}
                </strong>

              </div>

              <div className="admin-review-detail">

                <span>
                  Amount Sent
                </span>

                <strong>
                  {formatCryptoAmount(
                    selectedDeposit.cryptoAmount
                  )}{" "}
                  {selectedDeposit.currency ||
                    ""}
                </strong>

              </div>

              <div className="admin-review-detail">

                <span>
                  Status
                </span>

                <strong>
                  {selectedDeposit.status}
                </strong>

              </div>

              <div className="admin-review-detail">

                <span>
                  User ID
                </span>

                <strong className="admin-break-text">
                  {selectedDeposit.userId}
                </strong>

              </div>

              <div className="admin-review-detail">

                <span>
                  Submitted
                </span>

                <strong>
                  {formatDate(
                    selectedDeposit.createdAt
                  )}
                </strong>

              </div>

            </div>

            <div className="admin-review-block">

              <div className="admin-review-block-header">

                <strong>
                  Receiving Address
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      selectedDeposit.walletAddress,
                      "Receiving address copied."
                    )
                  }
                >
                  Copy
                </button>

              </div>

              <p className="admin-break-text">
                {selectedDeposit.walletAddress ||
                  "Not available"}
              </p>

            </div>

            <div className="admin-review-block">

              <div className="admin-review-block-header">

                <strong>
                  Transaction Hash / TXID
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      selectedDeposit.transactionHash,
                      "Transaction hash copied."
                    )
                  }
                >
                  Copy
                </button>

              </div>

              <p className="admin-break-text">
                {selectedDeposit.transactionHash ||
                  "No transaction hash supplied"}
              </p>

            </div>

            <div className="wallet-modal-notice">

              <span>
                !
              </span>

              <p>
                <strong>
                  Verify before approving.
                </strong>{" "}
                Confirm the TXID exists on the
                blockchain, matches the selected
                network, was sent to the receiving
                address above, and contains the
                expected cryptocurrency amount.
              </p>

            </div>

            {selectedDeposit.status ===
              "pending" && (

              <div className="admin-review-actions">

                <button
                  type="button"
                  className="premium-reject"
                  disabled={
                    processingId ===
                    selectedDeposit.id
                  }
                  onClick={() =>
                    handleDepositAction(
                      selectedDeposit,
                      "rejected"
                    )
                  }
                >
                  {processingId ===
                  selectedDeposit.id
                    ? "Processing..."
                    : "Reject Deposit"}
                </button>

                <button
                  type="button"
                  className="premium-approve"
                  disabled={
                    processingId ===
                    selectedDeposit.id
                  }
                  onClick={() =>
                    handleDepositAction(
                      selectedDeposit,
                      "approved"
                    )
                  }
                >
                  {processingId ===
                  selectedDeposit.id
                    ? "Processing..."
                    : "Approve Deposit"}
                </button>

              </div>

            )}

            {selectedDeposit.status !==
              "pending" && (

              <div
                style={{
                  textAlign: "center",
                  padding: "14px",
                  borderRadius: "12px",
                  background:
                    "rgba(0,0,0,0.04)",
                  fontWeight: "700",
                }}
              >
                This deposit has already been{" "}
                {selectedDeposit.status}.
              </div>

            )}

          </div>

        </div>

      )}

      {/* ==================================================
          WITHDRAWAL REVIEW MODAL
      ================================================== */}

      {selectedWithdrawal && (

        <div
          className="wallet-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedWithdrawal(null);
            }
          }}
        >

          <div className="wallet-deposit-modal admin-review-modal">

            <button
              className="wallet-modal-close"
              type="button"
              onClick={() =>
                setSelectedWithdrawal(null)
              }
              aria-label="Close"
            >
              ×
            </button>

            <div className="wallet-modal-header">

              <div className="wallet-modal-icon">
                ↓
              </div>

              <div>

                <span>
                  WITHDRAWAL VERIFICATION
                </span>

                <h2>
                  Review Crypto Withdrawal
                </h2>

              </div>

            </div>

            <p className="wallet-modal-description">
              Verify the user's withdrawal details
              and destination address before sending
              the cryptocurrency.
            </p>

            {/* AMOUNT */}

            <div className="admin-review-amount">

              <span>
                Withdrawal Value
              </span>

              <strong>
                $
                {formatMoney(
                  selectedWithdrawal.amount
                )}
              </strong>

            </div>

            {/* DETAILS */}

            <div className="admin-review-details">

              <div className="admin-review-detail">

                <span>
                  Cryptocurrency
                </span>

                <strong>
                  {selectedWithdrawal.cryptoName ||
                    "Cryptocurrency"}{" "}
                  (
                  {selectedWithdrawal.currency ||
                    "Crypto"}
                  )
                </strong>

              </div>

              <div className="admin-review-detail">

                <span>
                  Network
                </span>

                <strong>
                  {selectedWithdrawal.network ||
                    "Not specified"}
                </strong>

              </div>

              <div className="admin-review-detail">

                <span>
                  Amount
                </span>

                <strong>
                  {formatCryptoAmount(
                    selectedWithdrawal.cryptoAmount
                  )}{" "}
                  {selectedWithdrawal.currency ||
                    ""}
                </strong>

              </div>

              <div className="admin-review-detail">

                <span>
                  User ID
                </span>

                <strong className="admin-break-text">
                  {selectedWithdrawal.userId}
                </strong>

              </div>

              <div className="admin-review-detail">

                <span>
                  Status
                </span>

                <strong>
                  {selectedWithdrawal.status}
                </strong>

              </div>

              <div className="admin-review-detail">

                <span>
                  Submitted
                </span>

                <strong>
                  {formatDate(
                    selectedWithdrawal.createdAt
                  )}
                </strong>

              </div>

            </div>

            {/* DESTINATION ADDRESS */}

            <div className="admin-review-block">

              <div className="admin-review-block-header">

                <strong>
                  Destination Wallet Address
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      selectedWithdrawal.destinationAddress,
                      "Destination address copied."
                    )
                  }
                >
                  Copy
                </button>

              </div>

              <p className="admin-break-text">
                {selectedWithdrawal.destinationAddress ||
                  "No destination address supplied"}
              </p>

            </div>

            {/* WARNING */}

            <div className="wallet-modal-notice">

              <span>
                !
              </span>

              <p>
                <strong>
                  Verify before sending.
                </strong>{" "}
                Confirm the destination address,
                cryptocurrency and network carefully.
                Crypto sent to the wrong address or
                network may be permanently lost.
              </p>

            </div>

            {/* ACTIONS */}

            {selectedWithdrawal.status ===
              "pending" && (

              <div className="admin-review-actions">

                <button
                  type="button"
                  className="premium-reject"
                  disabled={
                    processingId ===
                    selectedWithdrawal.id
                  }
                  onClick={() =>
                    handleWithdrawalAction(
                      selectedWithdrawal,
                      "rejected"
                    )
                  }
                >
                  {processingId ===
                  selectedWithdrawal.id
                    ? "Processing..."
                    : "Reject Withdrawal"}
                </button>

                <button
                  type="button"
                  className="premium-approve"
                  disabled={
                    processingId ===
                    selectedWithdrawal.id
                  }
                  onClick={() =>
                    handleWithdrawalAction(
                      selectedWithdrawal,
                      "approved"
                    )
                  }
                >
                  {processingId ===
                  selectedWithdrawal.id
                    ? "Processing..."
                    : "Approve Withdrawal"}
                </button>

              </div>

            )}

            {selectedWithdrawal.status !==
              "pending" && (

              <div
                style={{
                  textAlign: "center",
                  padding: "14px",
                  borderRadius: "12px",
                  background:
                    "rgba(0,0,0,0.04)",
                  fontWeight: "700",
                }}
              >
                This withdrawal has already been{" "}
                {selectedWithdrawal.status}.
              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}