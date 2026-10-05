import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

const CRYPTO_OPTIONS = [
  {
    id: "BTC",
    name: "Bitcoin",
    symbol: "BTC",
    network: "Bitcoin",
    address:
      "bc1qlwaxr3mx309kmfxcx0yl2r8sk72qukrvqsgd28",
    icon: "₿",
  },
  {
    id: "USDT_TRC20",
    name: "Tether",
    symbol: "USDT",
    network: "TRC20",
    address:
      "TRQUAoB3KSkPE53Tshd3ZhFyyJiavJmT7y",
    icon: "₮",
  },
  {
    id: "USDT_ERC20",
    name: "Tether",
    symbol: "USDT",
    network: "ERC20",
    address:
      "0x4B81ccda29B600CFd408dF3e1c217ace9A183e2E",
    icon: "₮",
  },
  {
    id: "ETH",
    name: "Ethereum",
    symbol: "ETH",
    network: "Ethereum",
    address:
      "0x4B81ccda29B600CFd408dF3e1c217ace9A183e2E",
    icon: "Ξ",
  },
  {
    id: "USDC",
    name: "USD Coin",
    symbol: "USDC",
    network: "ERC20",
    address:
      "0x4B81ccda29B600CFd408dF3e1c217ace9A183e2E",
    icon: "$",
  },
];

export default function Wallet({
  user,
  userData,
  onBack,
}) {
  // ==========================================
  // PAGE STATE
  // ==========================================

  const [showDeposit, setShowDeposit] =
    useState(false);

  const [showWithdraw, setShowWithdraw] =
    useState(false);

  const [selectedCrypto, setSelectedCrypto] =
    useState(CRYPTO_OPTIONS[0]);

  // ==========================================
  // DEPOSIT STATE
  // ==========================================

  const [amount, setAmount] =
    useState("");

  const [cryptoAmount, setCryptoAmount] =
    useState("");

  const [transactionHash, setTransactionHash] =
    useState("");

  // ==========================================
  // WITHDRAWAL STATE
  // ==========================================

  const [withdrawAmount, setWithdrawAmount] =
    useState("");

  const [withdrawCryptoAmount, setWithdrawCryptoAmount] =
    useState("");

  const [withdrawAddress, setWithdrawAddress] =
    useState("");

  // ==========================================
  // DATA STATE
  // ==========================================

  const [deposits, setDeposits] =
    useState([]);

  const [withdrawals, setWithdrawals] =
    useState([]);

  const [submitting, setSubmitting] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  // ==========================================
  // BALANCE
  // ==========================================

  const balance = Number(
    userData?.balance || 0
  );

  // ==========================================
  // DEPOSIT TOTALS
  // ==========================================

  const totalDeposited = deposits
    .filter(
      (deposit) =>
        deposit.status === "approved"
    )
    .reduce(
      (total, deposit) =>
        total +
        Number(deposit.amount || 0),
      0
    );

  const pendingDeposits = deposits
    .filter(
      (deposit) =>
        deposit.status === "pending"
    )
    .reduce(
      (total, deposit) =>
        total +
        Number(deposit.amount || 0),
      0
    );

  // ==========================================
  // WITHDRAWAL TOTALS
  // ==========================================

  const pendingWithdrawals =
    withdrawals
      .filter(
        (withdrawal) =>
          withdrawal.status === "pending"
      )
      .reduce(
        (total, withdrawal) =>
          total +
          Number(
            withdrawal.amount || 0
          ),
        0
      );

  const approvedWithdrawals =
    withdrawals
      .filter(
        (withdrawal) =>
          withdrawal.status === "approved"
      )
      .reduce(
        (total, withdrawal) =>
          total +
          Number(
            withdrawal.amount || 0
          ),
        0
      );

  // ==========================================
  // LOAD DEPOSIT HISTORY
  // ==========================================

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(
        db,
        "depositRequests"
      ),
      where(
        "userId",
        "==",
        user.uid
      )
    );

    const unsubscribe =
      onSnapshot(
        q,
        (snapshot) => {
          const data =
            snapshot.docs.map(
              (item) => ({
                id: item.id,
                ...item.data(),
              })
            );

          data.sort(
            (a, b) => {
              const aTime =
                a.createdAt?.toMillis?.() ||
                0;

              const bTime =
                b.createdAt?.toMillis?.() ||
                0;

              return bTime - aTime;
            }
          );

          setDeposits(data);
        },
        (error) => {
          console.error(
            "Deposit request error:",
            error
          );
        }
      );

    return () => unsubscribe();
  }, [user]);

  // ==========================================
  // LOAD WITHDRAWAL HISTORY
  // ==========================================

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(
        db,
        "withdrawalRequests"
      ),
      where(
        "userId",
        "==",
        user.uid
      )
    );

    const unsubscribe =
      onSnapshot(
        q,
        (snapshot) => {
          const data =
            snapshot.docs.map(
              (item) => ({
                id: item.id,
                ...item.data(),
              })
            );

          data.sort(
            (a, b) => {
              const aTime =
                a.createdAt?.toMillis?.() ||
                0;

              const bTime =
                b.createdAt?.toMillis?.() ||
                0;

              return bTime - aTime;
            }
          );

          setWithdrawals(data);
        },
        (error) => {
          console.error(
            "Withdrawal request error:",
            error
          );
        }
      );

    return () => unsubscribe();
  }, [user]);

  // ==========================================
  // RESET DEPOSIT FORM
  // ==========================================

  const resetDepositForm = () => {
    setAmount("");
    setCryptoAmount("");
    setTransactionHash("");
    setSelectedCrypto(
      CRYPTO_OPTIONS[0]
    );
    setCopied(false);
  };

  // ==========================================
  // RESET WITHDRAWAL FORM
  // ==========================================

  const resetWithdrawForm = () => {
    setWithdrawAmount("");
    setWithdrawCryptoAmount("");
    setWithdrawAddress("");
    setSelectedCrypto(
      CRYPTO_OPTIONS[0]
    );
  };

  // ==========================================
  // OPEN DEPOSIT
  // ==========================================

  const openDeposit = () => {
    resetDepositForm();
    setShowDeposit(true);
  };

  // ==========================================
  // OPEN WITHDRAWAL
  // ==========================================

  const openWithdraw = () => {
    resetWithdrawForm();
    setShowWithdraw(true);
  };

  // ==========================================
  // COPY DEPOSIT ADDRESS
  // ==========================================

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(
        selectedCrypto.address
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Copy address error:",
        error
      );

      alert(
        "Unable to copy the address. Please copy it manually."
      );
    }
  };

  // ==========================================
  // SUBMIT CRYPTO DEPOSIT
  // ==========================================

  const submitDeposit = async (
    event
  ) => {
    event.preventDefault();

    const numericAmount =
      Number(amount);

    const numericCryptoAmount =
      Number(cryptoAmount);

    const txHash =
      transactionHash.trim();

    if (
      !numericAmount ||
      numericAmount <= 0
    ) {
      alert(
        "Please enter the USD value of your deposit."
      );
      return;
    }

    if (numericAmount < 10) {
      alert(
        "Minimum deposit amount is $10."
      );
      return;
    }

    if (
      !numericCryptoAmount ||
      numericCryptoAmount <= 0
    ) {
      alert(
        `Please enter the amount of ${selectedCrypto.symbol} you sent.`
      );
      return;
    }

    if (!txHash) {
      alert(
        "Please enter your transaction hash / TXID."
      );
      return;
    }

    if (txHash.length < 8) {
      alert(
        "The transaction hash appears to be too short."
      );
      return;
    }

    try {
      setSubmitting(true);

      await addDoc(
        collection(
          db,
          "depositRequests"
        ),
        {
          userId: user.uid,

          amount:
            numericAmount,

          cryptoAmount:
            numericCryptoAmount,

          currency:
            selectedCrypto.symbol,

          cryptoName:
            selectedCrypto.name,

          network:
            selectedCrypto.network,

          walletAddress:
            selectedCrypto.address,

          transactionHash:
            txHash,

          method:
            "Crypto",

          status:
            "pending",

          createdAt:
            serverTimestamp(),
        }
      );

      resetDepositForm();
      setShowDeposit(false);

      alert(
        "Crypto deposit submitted successfully.\n\nYour deposit is pending verification. Your balance will remain unchanged until the transaction is verified."
      );
    } catch (error) {
      console.error(
        "Crypto deposit submission error:",
        error
      );

      alert(
        "Unable to submit your crypto deposit. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // SUBMIT CRYPTO WITHDRAWAL
  // ==========================================

  const submitWithdrawal =
    async (event) => {
      event.preventDefault();

      const numericAmount =
        Number(withdrawAmount);

      const numericCryptoAmount =
        Number(
          withdrawCryptoAmount
        );

      const walletAddress =
        withdrawAddress.trim();

      if (
        !numericAmount ||
        numericAmount <= 0
      ) {
        alert(
          "Please enter the USD value you want to withdraw."
        );
        return;
      }

      if (numericAmount < 10) {
        alert(
          "Minimum withdrawal amount is $10."
        );
        return;
      }

      const availableForWithdrawal =
  Math.max(balance - pendingWithdrawals, 0);

if (numericAmount > availableForWithdrawal) {
  alert(
    `Insufficient available balance.\n\nYou can currently withdraw up to $${formatMoney(
      availableForWithdrawal
    )}.`
  );
  return;
}

      if (
        !numericCryptoAmount ||
        numericCryptoAmount <= 0
      ) {
        alert(
          `Please enter the amount of ${selectedCrypto.symbol} you want to receive.`
        );
        return;
      }

      if (!walletAddress) {
        alert(
          "Please enter your receiving wallet address."
        );
        return;
      }

      if (
        walletAddress.length < 10
      ) {
        alert(
          "The wallet address appears to be too short."
        );
        return;
      }

      const confirmWithdrawal =
        window.confirm(
          `Submit a $${formatMoney(
            numericAmount
          )} ${selectedCrypto.symbol} withdrawal?\n\nYour balance will not be deducted until an administrator reviews and approves the request.`
        );

      if (!confirmWithdrawal) {
        return;
      }

      try {
        setSubmitting(true);

        await addDoc(
          collection(
            db,
            "withdrawalRequests"
          ),
          {
            userId:
              user.uid,

            amount:
              numericAmount,

            cryptoAmount:
              numericCryptoAmount,

            currency:
              selectedCrypto.symbol,

            cryptoName:
              selectedCrypto.name,

            network:
              selectedCrypto.network,

            walletAddress:
              walletAddress,

            method:
              "Crypto",

            status:
              "pending",

            createdAt:
              serverTimestamp(),
          }
        );

        resetWithdrawForm();
        setShowWithdraw(false);

        alert(
          "Crypto withdrawal request submitted successfully.\n\nYour request is pending review. Your balance will remain unchanged until the withdrawal is approved and processed."
        );
      } catch (error) {
        console.error(
          "Crypto withdrawal submission error:",
          error
        );

        alert(
          "Unable to submit your withdrawal request. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    };

  // ==========================================
  // FORMAT MONEY
  // ==========================================

  const formatMoney = (
    value
  ) =>
    Number(
      value || 0
    ).toLocaleString(
      "en-US",
      {
        minimumFractionDigits:
          2,
        maximumFractionDigits:
          2,
      }
    );

  // ==========================================
  // FORMAT CRYPTO
  // ==========================================

  const formatCryptoAmount =
    (value) =>
      Number(
        value || 0
      ).toLocaleString(
        "en-US",
        {
          maximumFractionDigits:
            12,
        }
      );

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (
    timestamp
  ) => {
    if (
      !timestamp?.toDate
    ) {
      return "Processing";
    }

    return timestamp
      .toDate()
      .toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      );
  };

  // ==========================================
  // STATUS
  // ==========================================

  const getStatusLabel =
    (status) => {
      if (!status)
        return "Pending";

      return (
        status
          .charAt(0)
          .toUpperCase() +
        status.slice(1)
      );
    };

  const getStatusClass =
    (status) => {
      if (
        status ===
        "approved"
      ) {
        return "approved";
      }

      if (
        status ===
        "rejected"
      ) {
        return "rejected";
      }

      return "pending";
    };

  return (
    <div className="wallet-page premium-wallet-page">

      {/* ======================================
          TOP BAR
      ======================================= */}

      <div className="wallet-topbar">

        <button
          className="wallet-back-btn"
          onClick={onBack}
        >
          <span className="wallet-back-icon">
            ←
          </span>

          <span>
            Dashboard
          </span>
        </button>

        <div className="wallet-brand">

          <div className="wallet-brand-mark">
            I
          </div>

          <span>
            InvestPro
          </span>

        </div>

        <div className="wallet-top-status">

          <span className="status-dot"></span>

          Secure Wallet

        </div>

      </div>

      <main className="wallet-main-content">

        {/* ====================================
            PAGE HEADER
        ===================================== */}

        <div className="wallet-page-header">

          <div>

            <span className="wallet-eyebrow">
              FINANCIAL CENTER
            </span>

            <h1>
              My Wallet
            </h1>

            <p>
              Manage your crypto deposits,
              withdrawals and account balance
              from one secure place.
            </p>

          </div>

          <button
            className="wallet-header-deposit-btn"
            onClick={openDeposit}
          >
            <span>
              ＋
            </span>

            Deposit Crypto

          </button>

        </div>

        {/* ====================================
            BALANCE HERO
        ===================================== */}

        <section className="wallet-hero-card">

          <div className="wallet-hero-content">

            <div className="wallet-hero-label">

              <span className="wallet-small-icon">
                ◉
              </span>

              AVAILABLE BALANCE

            </div>

            <h2>
              ${formatMoney(balance)}
            </h2>

            <p>
              Available for investments,
              withdrawals and other account
              activities.
            </p>

            <div className="wallet-hero-actions">

              <button
                className="wallet-primary-action"
                onClick={openDeposit}
              >
                <span>
                  ₿
                </span>

                Deposit Crypto

              </button>

              <button
                className="wallet-secondary-action"
                onClick={openWithdraw}
              >
                <span>
                  ↑
                </span>

                Withdraw

              </button>

            </div>

          </div>

          <div className="wallet-hero-decoration">

            <div className="wallet-glow-circle wallet-glow-one"></div>

            <div className="wallet-glow-circle wallet-glow-two"></div>

            <div className="wallet-card-symbol">
              ₿
            </div>

          </div>

        </section>

        {/* ====================================
            WALLET STATS
        ===================================== */}

        <section className="wallet-stat-grid">

          <div className="wallet-stat-card">

            <div className="wallet-stat-icon wallet-stat-green">
              ↑
            </div>

            <div>

              <span>
                Total Deposited
              </span>

              <strong>
                ${formatMoney(
                  totalDeposited
                )}
              </strong>

            </div>

          </div>

          <div className="wallet-stat-card">

            <div className="wallet-stat-icon wallet-stat-orange">
              ◷
            </div>

            <div>

              <span>
                Pending Deposits
              </span>

              <strong>
                ${formatMoney(
                  pendingDeposits
                )}
              </strong>

            </div>

          </div>

          <div className="wallet-stat-card">

            <div className="wallet-stat-icon wallet-stat-blue">
              $
            </div>

            <div>

              <span>
                Current Balance
              </span>

              <strong>
                ${formatMoney(
                  balance
                )}
              </strong>

            </div>

          </div>

        </section>

        {/* ====================================
            CRYPTO DEPOSIT SECTION
        ===================================== */}

        <section className="wallet-content-card">

          <div className="wallet-section-heading">

            <div>

              <span className="wallet-section-label">
                FUND YOUR ACCOUNT
              </span>

              <h2>
                Crypto Deposit
              </h2>

              <p>
                Send cryptocurrency to your
                InvestPro receiving address.
              </p>

            </div>

            <button
              className="wallet-small-deposit-btn"
              onClick={openDeposit}
            >
              + Deposit Crypto
            </button>

          </div>

          <div className="wallet-method-grid">

            {CRYPTO_OPTIONS.map(
              (crypto) => (

                <button
                  key={crypto.id}
                  className="wallet-method-card"
                  onClick={() => {
                    setSelectedCrypto(
                      crypto
                    );

                    setShowDeposit(
                      true
                    );
                  }}
                >

                  <div className="wallet-method-icon crypto-icon">
                    {crypto.icon}
                  </div>

                  <div>

                    <strong>
                      {crypto.name} (
                      {crypto.symbol})
                    </strong>

                    <span>
                      {crypto.network}
                    </span>

                  </div>

                  <span className="wallet-method-arrow">
                    →
                  </span>

                </button>

              )
            )}

          </div>

        </section>

        {/* ====================================
            WITHDRAW SECTION
        ===================================== */}

        <section className="wallet-content-card">

          <div className="wallet-section-heading">

            <div>

              <span className="wallet-section-label">
                ACCESS YOUR FUNDS
              </span>

              <h2>
                Crypto Withdrawal
              </h2>

              <p>
                Withdraw available funds to your
                personal cryptocurrency wallet.
              </p>

            </div>

            <button
              className="wallet-small-deposit-btn"
              onClick={openWithdraw}
            >
              ↑ Withdraw
            </button>

          </div>

          <div className="wallet-method-grid">

            {CRYPTO_OPTIONS.map(
              (crypto) => (

                <button
                  key={`withdraw-${crypto.id}`}
                  className="wallet-method-card"
                  onClick={() => {
                    setSelectedCrypto(
                      crypto
                    );

                    setShowWithdraw(
                      true
                    );
                  }}
                >

                  <div className="wallet-method-icon crypto-icon">
                    {crypto.icon}
                  </div>

                  <div>

                    <strong>
                      {crypto.name} (
                      {crypto.symbol})
                    </strong>

                    <span>
                      Withdraw via{" "}
                      {crypto.network}
                    </span>

                  </div>

                  <span className="wallet-method-arrow">
                    →
                  </span>

                </button>

              )
            )}

          </div>

          <div
            style={{
              marginTop: "18px",
              padding: "14px 16px",
              borderRadius: "12px",
              background:
                "rgba(22, 163, 106, 0.07)",
              border:
                "1px solid rgba(22, 163, 106, 0.15)",
              fontSize: "13px",
              lineHeight: "1.6",
            }}
          >
            <strong>
              Available to withdraw:
            </strong>{" "}
            ${formatMoney(balance)}

            {pendingWithdrawals >
              0 && (
              <>
                {" "}
                · Pending withdrawal requests:
                {" "}
                $
                {formatMoney(
                  pendingWithdrawals
                )}
              </>
            )}
          </div>

        </section>

        {/* ====================================
            DEPOSIT HISTORY
        ===================================== */}

        <section className="wallet-content-card wallet-history-card">

          <div className="wallet-section-heading">

            <div>

              <span className="wallet-section-label">
                TRANSACTION ACTIVITY
              </span>

              <h2>
                Deposit History
              </h2>

              <p>
                Keep track of your submitted
                crypto deposit requests.
              </p>

            </div>

            <div className="wallet-history-count">

              {deposits.length}{" "}

              {deposits.length ===
              1
                ? "Request"
                : "Requests"}

            </div>

          </div>

          {deposits.length ===
          0 ? (

            <div className="wallet-empty-state">

              <div className="wallet-empty-icon">
                ₿
              </div>

              <h3>
                No crypto deposits yet
              </h3>

              <p>
                Your crypto deposit activity
                will appear here after you
                submit your first deposit.
              </p>

              <button
                className="wallet-empty-btn"
                onClick={openDeposit}
              >
                Make Your First Deposit
              </button>

            </div>

          ) : (

            <div className="wallet-deposit-list">

              {deposits.map(
                (deposit) => {

                  const statusClass =
                    getStatusClass(
                      deposit.status
                    );

                  return (

                    <div
                      className="wallet-deposit-row"
                      key={
                        deposit.id
                      }
                    >

                      <div className="wallet-deposit-left">

                        <div className="wallet-deposit-icon">
                          ₿
                        </div>

                        <div className="wallet-deposit-info">

                          <strong>
                            $
                            {formatMoney(
                              deposit.amount
                            )}
                          </strong>

                          <span>
                            {deposit.currency ||
                              "Crypto"}

                            {" · "}

                            {deposit.network ||
                              "Network"}

                            {" · "}

                            {formatDate(
                              deposit.createdAt
                            )}
                          </span>

                        </div>

                      </div>

                      <div className="wallet-deposit-right">

                        <span
                          className={`wallet-status wallet-status-${statusClass}`}
                        >

                          <i></i>

                          {getStatusLabel(
                            deposit.status
                          )}

                        </span>

                        <span className="wallet-row-arrow">
                          ›
                        </span>

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </section>

        {/* ====================================
            WITHDRAWAL HISTORY
        ===================================== */}

        <section className="wallet-content-card wallet-history-card">

          <div className="wallet-section-heading">

            <div>

              <span className="wallet-section-label">
                WITHDRAWAL ACTIVITY
              </span>

              <h2>
                Withdrawal History
              </h2>

              <p>
                Track your cryptocurrency
                withdrawal requests.
              </p>

            </div>

            <div className="wallet-history-count">

              {withdrawals.length}{" "}

              {withdrawals.length ===
              1
                ? "Request"
                : "Requests"}

            </div>

          </div>

          {withdrawals.length ===
          0 ? (

            <div className="wallet-empty-state">

              <div className="wallet-empty-icon">
                ↑
              </div>

              <h3>
                No withdrawals yet
              </h3>

              <p>
                Your withdrawal requests will
                appear here after you submit one.
              </p>

              <button
                className="wallet-empty-btn"
                onClick={openWithdraw}
              >
                Make Your First Withdrawal
              </button>

            </div>

          ) : (

            <div className="wallet-deposit-list">

              {withdrawals.map(
                (withdrawal) => {

                  const statusClass =
                    getStatusClass(
                      withdrawal.status
                    );

                  return (

                    <div
                      className="wallet-deposit-row"
                      key={
                        withdrawal.id
                      }
                    >

                      <div className="wallet-deposit-left">

                        <div className="wallet-deposit-icon">
                          ↑
                        </div>

                        <div className="wallet-deposit-info">

                          <strong>
                            $
                            {formatMoney(
                              withdrawal.amount
                            )}
                          </strong>

                          <span>
                            {withdrawal.currency ||
                              "Crypto"}

                            {" · "}

                            {withdrawal.network ||
                              "Network"}

                            {" · "}

                            {formatDate(
                              withdrawal.createdAt
                            )}
                          </span>

                        </div>

                      </div>

                      <div className="wallet-deposit-right">

                        <span
                          className={`wallet-status wallet-status-${statusClass}`}
                        >

                          <i></i>

                          {getStatusLabel(
                            withdrawal.status
                          )}

                        </span>

                        <span className="wallet-row-arrow">
                          ›
                        </span>

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </section>

        {/* ====================================
            SECURITY NOTICE
        ===================================== */}

        <section className="wallet-security-card">

          <div className="wallet-security-icon">
            ✓
          </div>

          <div>

            <strong>
              Crypto withdrawals are reviewed
            </strong>

            <p>
              Withdrawal requests are reviewed
              before processing. Your available
              balance remains unchanged while a
              withdrawal is pending.
            </p>

          </div>

        </section>

      </main>

      {/* ======================================
          CRYPTO DEPOSIT MODAL
      ======================================= */}

      {showDeposit && (

        <div
          className="wallet-modal-overlay"
          onMouseDown={(
            event
          ) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              setShowDeposit(
                false
              );
            }

          }}
        >

          <div className="wallet-deposit-modal">

            <button
              className="wallet-modal-close"
              onClick={() => {
                setShowDeposit(
                  false
                );

                resetDepositForm();
              }}
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
                  CRYPTO DEPOSIT
                </span>

                <h2>
                  Deposit Cryptocurrency
                </h2>

              </div>

            </div>

            <p className="wallet-modal-description">
              Send your cryptocurrency to the
              receiving address below, then submit
              your transaction details for verification.
            </p>

            <form
              onSubmit={
                submitDeposit
              }
            >

              {/* CRYPTO */}

              <div className="wallet-form-group">

                <label>
                  Cryptocurrency
                </label>

                <div className="wallet-payment-options">

                  {CRYPTO_OPTIONS.map(
                    (crypto) => (

                      <button
                        type="button"
                        key={
                          crypto.id
                        }
                        className={
                          selectedCrypto.id ===
                          crypto.id
                            ? "wallet-payment-option selected"
                            : "wallet-payment-option"
                        }
                        onClick={() =>
                          setSelectedCrypto(
                            crypto
                          )
                        }
                      >

                        <span className="payment-option-icon">
                          {crypto.icon}
                        </span>

                        <span>

                          <strong>
                            {crypto.name} (
                            {crypto.symbol})
                          </strong>

                          <small>
                            {crypto.network}
                          </small>

                        </span>

                        <span className="payment-radio">

                          {selectedCrypto.id ===
                          crypto.id
                            ? "✓"
                            : ""}

                        </span>

                      </button>

                    )
                  )}

                </div>

              </div>

              {/* RECEIVING ADDRESS */}

              <div className="wallet-form-group">

                <label>
                  Send To
                </label>

                <div
                  style={{
                    padding:
                      "16px",
                    borderRadius:
                      "14px",
                    background:
                      "rgba(22, 163, 106, 0.08)",
                    border:
                      "1px solid rgba(22, 163, 106, 0.20)",
                  }}
                >

                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      marginBottom:
                        "10px",
                      gap: "10px",
                    }}
                  >

                    <strong>
                      {
                        selectedCrypto.symbol
                      }
                    </strong>

                    <small>
                      {
                        selectedCrypto.network
                      }
                    </small>

                  </div>

                  <div
                    style={{
                      wordBreak:
                        "break-all",
                      fontSize:
                        "13px",
                      lineHeight:
                        "1.6",
                      marginBottom:
                        "12px",
                    }}
                  >
                    {
                      selectedCrypto.address
                    }
                  </div>

                  <button
                    type="button"
                    onClick={
                      copyAddress
                    }
                    style={{
                      width:
                        "100%",
                      border:
                        "none",
                      borderRadius:
                        "10px",
                      padding:
                        "11px",
                      cursor:
                        "pointer",
                      fontWeight:
                        "700",
                    }}
                  >
                    {copied
                      ? "✓ Address Copied"
                      : "Copy Address"}
                  </button>

                </div>

                <div
                  style={{
                    marginTop:
                      "10px",
                    padding:
                      "11px 13px",
                    borderRadius:
                      "10px",
                    background:
                      "rgba(220, 53, 69, 0.08)",
                    color:
                      "#b42318",
                    fontSize:
                      "12px",
                    lineHeight:
                      "1.5",
                  }}
                >
                  ⚠️ Send only{" "}
                  <strong>
                    {
                      selectedCrypto.symbol
                    }
                  </strong>{" "}
                  using the{" "}
                  <strong>
                    {
                      selectedCrypto.network
                    }
                  </strong>{" "}
                  network. Sending another asset or
                  using the wrong network may result
                  in permanent loss of funds.
                </div>

              </div>

              {/* USD */}

              <div className="wallet-form-group">

                <label>
                  Deposit Value (USD)
                </label>

                <div className="wallet-amount-input">

                  <span>
                    $
                  </span>

                  <input
                    type="number"
                    min="10"
                    step="0.01"
                    value={amount}
                    onChange={(
                      event
                    ) =>
                      setAmount(
                        event.target
                          .value
                      )
                    }
                    placeholder="0.00"
                  />

                  <small>
                    USD
                  </small>

                </div>

                <div className="wallet-minimum">
                  Minimum deposit:{" "}
                  <strong>
                    $10.00
                  </strong>
                </div>

              </div>

              {/* CRYPTO AMOUNT */}

              <div className="wallet-form-group">

                <label>
                  Amount Sent (
                  {
                    selectedCrypto.symbol
                  }
                  )
                </label>

                <div className="wallet-amount-input">

                  <span>
                    {
                      selectedCrypto.icon
                    }
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={
                      cryptoAmount
                    }
                    onChange={(
                      event
                    ) =>
                      setCryptoAmount(
                        event.target
                          .value
                      )
                    }
                    placeholder={`0.00 ${selectedCrypto.symbol}`}
                  />

                  <small>
                    {
                      selectedCrypto.symbol
                    }
                  </small>

                </div>

              </div>

              {/* TXID */}

              <div className="wallet-form-group">

                <label>
                  Transaction Hash / TXID
                </label>

                <input
                  type="text"
                  value={
                    transactionHash
                  }
                  onChange={(
                    event
                  ) =>
                    setTransactionHash(
                      event.target
                        .value
                    )
                  }
                  placeholder="Paste your transaction hash here"
                  autoComplete="off"
                  spellCheck="false"
                  style={{
                    width:
                      "100%",
                    boxSizing:
                      "border-box",
                    padding:
                      "14px 15px",
                    border:
                      "1px solid rgba(0,0,0,0.12)",
                    borderRadius:
                      "12px",
                    outline:
                      "none",
                    fontSize:
                      "14px",
                  }}
                />

                <small
                  style={{
                    display:
                      "block",
                    marginTop:
                      "7px",
                    opacity:
                      0.65,
                    lineHeight:
                      "1.5",
                  }}
                >
                  The TXID is the transaction
                  identifier from the wallet or
                  exchange you used to send the crypto.
                </small>

              </div>

              <div className="wallet-modal-notice">

                <span>
                  i
                </span>

                <p>
                  Your deposit will be marked
                  <strong>
                    {" "}
                    Pending{" "}
                  </strong>
                  after submission. Your account
                  balance will not change until an
                  administrator verifies the
                  transaction.
                </p>

              </div>

              <button
                className="wallet-submit-btn"
                type="submit"
                disabled={
                  submitting
                }
              >

                {submitting ? (

                  <>
                    <span className="wallet-spinner"></span>

                    Submitting Deposit...

                  </>

                ) : (

                  <>
                    Submit Crypto Deposit

                    <span>
                      →
                    </span>
                  </>

                )}

              </button>

            </form>

          </div>

        </div>

      )}

      {/* ======================================
          CRYPTO WITHDRAWAL MODAL
      ======================================= */}

      {showWithdraw && (

        <div
          className="wallet-modal-overlay"
          onMouseDown={(
            event
          ) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              setShowWithdraw(
                false
              );
            }

          }}
        >

          <div className="wallet-deposit-modal">

            <button
              className="wallet-modal-close"
              onClick={() => {
                setShowWithdraw(
                  false
                );

                resetWithdrawForm();
              }}
              aria-label="Close"
            >
              ×
            </button>

            <div className="wallet-modal-header">

              <div className="wallet-modal-icon">
                ↑
              </div>

              <div>

                <span>
                  CRYPTO WITHDRAWAL
                </span>

                <h2>
                  Withdraw Cryptocurrency
                </h2>

              </div>

            </div>

            <p className="wallet-modal-description">
              Enter the amount you want to
              withdraw and the cryptocurrency
              wallet address that should receive
              the funds.
            </p>

            <form
              onSubmit={
                submitWithdrawal
              }
            >

              {/* AVAILABLE BALANCE */}

              <div
                style={{
                  padding:
                    "15px 16px",
                  marginBottom:
                    "20px",
                  borderRadius:
                    "13px",
                  background:
                    "rgba(22, 163, 106, 0.08)",
                  border:
                    "1px solid rgba(22, 163, 106, 0.18)",
                }}
              >

                <small
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "5px",
                    opacity:
                      0.7,
                  }}
                >
                  AVAILABLE BALANCE
                </small>

                <strong
                  style={{
                    fontSize:
                      "22px",
                  }}
                >
                  $
                  {formatMoney(
                    balance
                  )}
                </strong>

              </div>

              {/* CRYPTO */}

              <div className="wallet-form-group">

                <label>
                  Cryptocurrency
                </label>

                <div className="wallet-payment-options">

                  {CRYPTO_OPTIONS.map(
                    (crypto) => (

                      <button
                        type="button"
                        key={`withdraw-option-${crypto.id}`}
                        className={
                          selectedCrypto.id ===
                          crypto.id
                            ? "wallet-payment-option selected"
                            : "wallet-payment-option"
                        }
                        onClick={() =>
                          setSelectedCrypto(
                            crypto
                          )
                        }
                      >

                        <span className="payment-option-icon">
                          {
                            crypto.icon
                          }
                        </span>

                        <span>

                          <strong>
                            {crypto.name} (
                            {
                              crypto.symbol
                            })
                          </strong>

                          <small>
                            {
                              crypto.network
                            }
                          </small>

                        </span>

                        <span className="payment-radio">

                          {selectedCrypto.id ===
                          crypto.id
                            ? "✓"
                            : ""}

                        </span>

                      </button>

                    )
                  )}

                </div>

              </div>

              {/* USD AMOUNT */}

              <div className="wallet-form-group">

                <label>
                  Withdrawal Value (USD)
                </label>

                <div className="wallet-amount-input">

                  <span>
                    $
                  </span>

                  <input
                    type="number"
                    min="10"
                    max={
                      balance
                    }
                    step="0.01"
                    value={
                      withdrawAmount
                    }
                    onChange={(
                      event
                    ) =>
                      setWithdrawAmount(
                        event.target
                          .value
                      )
                    }
                    placeholder="0.00"
                  />

                  <small>
                    USD
                  </small>

                </div>

                <div className="wallet-minimum">
                  Minimum withdrawal:{" "}
                  <strong>
                    $10.00
                  </strong>
                </div>

              </div>

              {/* CRYPTO AMOUNT */}

              <div className="wallet-form-group">

                <label>
                  Amount to Receive (
                  {
                    selectedCrypto.symbol
                  }
                  )
                </label>

                <div className="wallet-amount-input">

                  <span>
                    {
                      selectedCrypto.icon
                    }
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={
                      withdrawCryptoAmount
                    }
                    onChange={(
                      event
                    ) =>
                      setWithdrawCryptoAmount(
                        event.target
                          .value
                      )
                    }
                    placeholder={`0.00 ${selectedCrypto.symbol}`}
                  />

                  <small>
                    {
                      selectedCrypto.symbol
                    }
                  </small>

                </div>

                <small
                  style={{
                    display:
                      "block",
                    marginTop:
                      "7px",
                    opacity:
                      0.65,
                    lineHeight:
                      "1.5",
                  }}
                >
                  Enter the crypto amount you expect
                  to receive after any applicable
                  network or processing fees.
                </small>

              </div>

              {/* RECEIVING ADDRESS */}

              <div className="wallet-form-group">

                <label>
                  Your Receiving Wallet Address
                </label>

                <input
                  type="text"
                  value={
                    withdrawAddress
                  }
                  onChange={(
                    event
                  ) =>
                    setWithdrawAddress(
                      event.target
                        .value
                    )
                  }
                  placeholder={`Enter your ${selectedCrypto.symbol} ${selectedCrypto.network} wallet address`}
                  autoComplete="off"
                  spellCheck="false"
                  style={{
                    width:
                      "100%",
                    boxSizing:
                      "border-box",
                    padding:
                      "14px 15px",
                    border:
                      "1px solid rgba(0,0,0,0.12)",
                    borderRadius:
                      "12px",
                    outline:
                      "none",
                    fontSize:
                      "14px",
                  }}
                />

                <div
                  style={{
                    marginTop:
                      "10px",
                    padding:
                      "11px 13px",
                    borderRadius:
                      "10px",
                    background:
                      "rgba(220, 53, 69, 0.08)",
                    color:
                      "#b42318",
                    fontSize:
                      "12px",
                    lineHeight:
                      "1.5",
                  }}
                >
                  ⚠️ Make sure the wallet address
                  matches{" "}
                  <strong>
                    {
                      selectedCrypto.symbol
                    }
                  </strong>{" "}
                  and the{" "}
                  <strong>
                    {
                      selectedCrypto.network
                    }
                  </strong>{" "}
                  network. Crypto transactions
                  cannot normally be reversed after
                  they are sent.
                </div>

              </div>

              {/* NOTICE */}

              <div className="wallet-modal-notice">

                <span>
                  i
                </span>

                <p>
                  Your withdrawal request will be
                  marked{" "}
                  <strong>
                    Pending
                  </strong>
                  . Your balance will remain
                  unchanged until the request is
                  reviewed and approved.
                </p>

              </div>

              {/* SUBMIT */}

              <button
                className="wallet-submit-btn"
                type="submit"
                disabled={
                  submitting
                }
              >

                {submitting ? (

                  <>
                    <span className="wallet-spinner"></span>

                    Submitting Withdrawal...

                  </>

                ) : (

                  <>
                    Submit Withdrawal Request

                    <span>
                      →
                    </span>
                  </>

                )}

              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}