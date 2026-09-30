import "../css/HRLogin.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function HRLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [step, setStep] = useState("email");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = digit;
    setOtp(nextOtp);

    if (digit && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const nextOtp = Array(6).fill("");
    pasted.split("").forEach((digit, index) => {
      nextOtp[index] = digit;
    });
    setOtp(nextOtp);
    const focusIndex = Math.min(pasted.length, 5);
    document.getElementById(`otp-${focusIndex}`)?.focus();
  };

  const sendOTP = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your work email.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to send OTP.");
      }

      if (data.message === "Employee not found") {
        setError("This email is not registered in the HRM system.");
        return;
      }

      setMessage("A verification code has been sent to your email.");
      setStep("otp");

    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          otp: otp.join(""),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "OTP verification failed.");
      }

      if (data.message !== "Login successful") {
        setError(data.message || "Invalid OTP.");
        return;
      }

      // Important: HR portal accepts only HR accounts
      if (data.role !== "hr") {
        setError(
          "This account does not have HR access. Please use the Employee Portal."
        );
        return;
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("employee_id", data.employee_id);
      localStorage.setItem("role", data.role);

      navigate("/hr-dashboard");

    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const goBackToEmail = () => {
    setStep("email");
    setOtp(Array(6).fill(""));
    setError("");
    setMessage("");
  };

  return (
    <div className="login-page">

      {/* Header */}
      <header className="login-header">
        <button
          className="login-brand"
          onClick={() => navigate("/")}
        >
          <div className="login-brand-mark">H</div>

          <div>
            <div className="login-brand-name">HRM</div>
            <div className="login-brand-subtitle">
              Human Resource Management
            </div>
          </div>
        </button>

        <button className="help-button">
          Help & Support
        </button>
      </header>

      {/* Login Area */}
      <main className="login-main">

        <div className="login-card">

          {/* Card Header */}
          <div className="login-card-header">

            <div className="portal-badge">
              HR PORTAL
            </div>

            <h1>Welcome back</h1>

            <p>
              Sign in to your HR workspace
            </p>

          </div>

          {/* Email Step */}
          {step === "email" && (
            <form onSubmit={sendOTP}>

              <div className="form-group">

                <label htmlFor="email">
                  Work email
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                />

              </div>

              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send OTP"}
                {!loading && <span>→</span>}
              </button>

            </form>
          )}

          {/* OTP Step */}
          {step === "otp" && (
            <form onSubmit={verifyOTP}>

              <div className="otp-email">
                Code sent to
                <strong>{email}</strong>
              </div>

              <div className="form-group">

                <label htmlFor="otp">
                  Verification code
                </label>

                <div className="otp-boxes" onPaste={handleOtpPaste} aria-label="6-digit OTP">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      className="otp-box"
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(event) => handleOtpChange(index, event.target.value)}
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      aria-label={`OTP digit ${index + 1}`}
                    />
                  ))}
                </div>

              </div>

              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Continue"}
                {!loading && <span>→</span>}
              </button>

              <button
                type="button"
                className="change-email-button"
                onClick={goBackToEmail}
              >
                ← Use a different email
              </button>

            </form>
          )}

          {/* Messages */}
          {message && (
            <div className="success-message">
              {message}
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Security */}
          <div className="security-note">

            <div className="security-icon">
              ✓
            </div>

            <div>
              <strong>Secure authentication</strong>
              <span>
                Your login is protected with email OTP verification.
              </span>
            </div>

          </div>

          {/* Back */}
          <button
            className="back-button"
            onClick={() => navigate("/")}
          >
            ← Back to portal selection
          </button>

        </div>

      </main>

      {/* Footer */}
      <footer className="login-footer">
        <span>© 2026 HRM. All rights reserved.</span>

        <div>
          <span>Privacy</span>
          <span>Terms</span>
          <span>Help</span>
        </div>
      </footer>

    </div>
  );
}

export default HRLogin;
