import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import login_bg from "../assets/login_bg.png";
import login_top from "../assets/login-top.png";
import axiosInstance from "../api/axios";
import { useAuthStore } from "../stores/authStore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState("login"); // login | signup
  const [loginType, setLoginType] = useState("password"); // password | otp
  const [step, setStep] = useState(1);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errors, setErrors] = useState({});
  const { login: zustandLogin, register: zustandRegister, forgotPassword } = useAuthStore();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
    phone: "",
  });

  const [otpEmail, setOtpEmail] = useState("");

  // 🎨 Theme Colors
  const theme = {
    primary: "#00B562",
    secondary: "#E5E7EB",
    white: "#ffffff",
    dark: "#111827",
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const login = async () => {
    try {
      setIsLoggingIn(true);
      setErrors({});

      const success = await zustandLogin(form.email, form.password);

      if (success) {
        onSuccess();
        onClose();
      } else {
        setErrors({ api: "Login failed. Please check your credentials." });
      }
    } catch (err) {
      console.error("Login failed:", err);
      setErrors({ api: "Login failed. Please try again." });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const sendOtp = async () => {
    setErrors({});
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      setErrors({ email: "Valid email required" });
      return;
    }

    setIsLoggingIn(true);
    try {
      const response = await axiosInstance.post(`/api/auth/send-otp`, {
        email: form.email,
      });

      if (response.data.success) {
        setOtpEmail(form.email);
        setStep(2);
        toast.success("OTP sent to your email!");
      } else {
        setErrors({ api: response.data.message || "Failed to send OTP" });
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to send OTP. Please try again.";
      setErrors({ api: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const verifyOtpLogin = async () => {
    setErrors({});

    if (!form.otp || form.otp.length !== 6) {
      setErrors({ otp: "Please enter a valid 6-digit OTP" });
      return;
    }

    // OTP login not supported - redirect to password login
    setErrors({ api: "OTP login is not available. Please use password login." });
    toast.error("OTP login is not available. Please use password login.");
  };

  const otpSignup = async () => {
    setErrors({});
    if (!form.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrors({ email: "Valid email is required" });
      return;
    }
    if (!form.name?.trim()) {
      setErrors({ ...errors, name: "Name is required" });
      return;
    }
    if (!form.phone?.trim() || !/^\d{10}$/.test(form.phone)) {
      setErrors({ ...errors, phone: "Phone must be 10 digits" });
      return;
    }
    if (!form.password?.trim() || form.password.length < 6) {
      setErrors({ ...errors, password: "Password must be at least 6 characters" });
      return;
    }

    setIsLoggingIn(true);
    try {
      const response = await axiosInstance.post(`/api/auth/send-otp`, {
        email: form.email,
      });

      if (response.data.success) {
        setOtpEmail(form.email);
        setStep(2);
        toast.success("OTP sent to your email!");
      } else {
        setErrors({ api: response.data.message || "Failed to send OTP" });
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to send OTP. Please try again.";
      setErrors({ api: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const verifyOtpSignup = async () => {
    setErrors({});

    if (!form.otp || form.otp.length !== 6) {
      setErrors({ otp: "Please enter a valid 6-digit OTP" });
      return;
    }

    setIsLoggingIn(true);
    try {
      const response = await axiosInstance.post(`/api/auth/verify-otp`, {
        email: otpEmail,
        otp: form.otp,
        name: form.name,
        password: form.password,
        phone: form.phone,
      });

      if (response.data.token) {
        // Store in localStorage for persistence
        localStorage.setItem("spj", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Show registration success message
        toast.success("✓ Registration successful! You are now logged in.");

        // Trigger onSuccess callback
        onSuccess();

        // Close modal
        onClose();
      } else {
        setErrors({ api: response.data.message || "OTP verification failed" });
        toast.error(response.data.message || "OTP verification failed");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "OTP verification failed. Please try again.";
      setErrors({ api: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const resendOtp = async () => {
    setErrors({});
    setIsLoggingIn(true);
    try {
      const response = await axiosInstance.post(`/api/auth/resend-otp`, {
        email: otpEmail,
      });

      if (response.data.success) {
        toast.success("OTP resent to your email!");
      } else {
        setErrors({ api: response.data.message || "Failed to resend OTP" });
        toast.error(response.data.message || "Failed to resend OTP");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to resend OTP. Please try again.";
      setErrors({ api: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      setIsLoggingIn(true);
      setErrors({});

      const success = await forgotPassword(form.email);

      if (success) {
        toast.success("Redirect to forgot password page");
        onClose();
        navigate('/forgot-password');
        setForm({ name: "", email: "", password: "", otp: "", phone: "" });
        setAuthMode("login");
        setStep(1);
      } else {
        setErrors({ api: "Failed to send reset email." });
      }
    } catch (err) {
      console.error("Forgot password failed:", err);
      setErrors({ api: "Failed to send reset email." });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return isOpen ? ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="bg-white w-[900px] h-[550px] rounded-2xl overflow-hidden flex relative m-4">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-black"
        >
          ✕
        </button>

        {/* Left Image Section */}
        <div className="hidden md:block w-1/2 relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${login_bg})` }}
          />
          <img
            src={login_top}
            className="relative z-10 w-full h-full object-contain"
            alt="login"
          />
        </div>

        {/* Right Section */}
        <form
          className="w-full md:w-1/2 p-10 flex flex-col justify-center"
          onSubmit={(e) => {
            e.preventDefault();

            // LOGIN FLOW
            if (authMode === "login") {
              if (step === 1) {
                if (!form.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
                  setErrors({ email: "Valid email is required" });
                  return;
                }
                setStep(2);
                return;
              }

              if (step === 2 && loginType === "password") {
                login();
                return;
              }

              if (step === 2 && loginType === "otp") {
                verifyOtpLogin();
                return;
              }
            }

            // OTP SIGNUP FLOW
            if (authMode === "signup") {
              if (step === 1) {
                otpSignup();
                return;
              }

              if (step === 2) {
                verifyOtpSignup();
                return;
              }
            }
          }}
        >

          <h2 className="text-2xl font-semibold mb-4">
            {authMode === "login" ? "Sign In" : "Create Account"}
          </h2>

          {/* ================= TOGGLE LOGIN / SIGNUP ================= */}
          <div className="flex mb-4 gap-2">

            {step > 1 && <div
              onClick={() => {
                setStep(step - 1);
                setForm({ ...form, otp: "" });
              }}
              className="flex-1 py-2 rounded-lg w-auto cursor-pointer bg-gray-300 text-gray-700 font-semibold"
            >
              &lt;
            </div>}

            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setLoginType("password");
                setStep(1);
                setForm({ name: "", email: "", password: "", otp: "", phone: "" });
                setErrors({});
              }}
              style={{
                backgroundColor: authMode === "login" ? "#00B562" : "#E5E7EB",
                color: authMode === "login" ? "#ffffff" : "#111827",
              }}
              className="flex-1 py-2 rounded-lg font-semibold"
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode("signup");
                setStep(1);
                setForm({ name: "", email: "", password: "", otp: "", phone: "" });
                setErrors({});
              }}
              style={{
                backgroundColor: authMode === "signup" ? "#00B562" : "#E5E7EB",
                color: authMode === "signup" ? "#ffffff" : "#111827",
              }}
              className="flex-1 py-2 rounded-lg font-semibold"
            >
              Sign Up
            </button>
          </div>

          {/* ================= STEP 1 EMAIL ================= */}
          {step === 1 && (
            <>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className="border px-4 py-2 rounded-lg mb-4"
                placeholder="Enter email"
              />

              {/* Login Type Toggle */}
              {authMode === "login" ? (
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setLoginType("password")}
                    style={{
                      backgroundColor: loginType === "password" ? theme.primary : theme.secondary,
                      color: loginType === "password" ? theme.white : theme.dark,
                    }}
                    className="flex-1 py-2 rounded-lg"
                  >
                    Password
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoginType("otp")}
                    style={{
                      backgroundColor: loginType === "otp" ? theme.primary : theme.secondary,
                      color: loginType === "otp" ? theme.white : theme.dark,
                    }}
                    className="flex-1 py-2 rounded-lg"
                  >
                    OTP
                  </button>
                </div>
              ) : (
                <>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="border px-4 py-2 rounded-lg mb-4"
                    placeholder="Enter full name"
                    type="text"
                  />
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="border px-4 py-2 rounded-lg mb-4"
                    placeholder="Enter mobile number"
                    type="text"
                    maxLength={10}
                    minLength={10}
                  />
                  <input
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="border px-4 py-2 rounded-lg mb-4"
                    placeholder="Enter password"
                    type="password"
                  />
                </>
              )}

              <button
                type="submit"
                style={{ backgroundColor: theme.primary, color: theme.white }}
                className="py-3 rounded-lg"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "Loading..." : "Continue"}
              </button>
            </>
          )}

          {/* ================= LOGIN STEP 2 ================= */}
          {step === 2 && authMode === "login" && (
            <>
              {loginType === "password" && (
                <>
                  <input
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    type="password"
                    placeholder="Password"
                    className="border px-4 py-2 rounded-lg mb-3"
                  />

                  <div className="text-right mb-4">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    style={{ backgroundColor: theme.primary, color: theme.white }}
                    className="cursor-pointer py-3 rounded-lg"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? "Logging in..." : "Login"}
                  </button>
                </>
              )}

              {loginType === "otp" && (
                <>
                  <button
                    type="button"
                    onClick={sendOtp}
                    style={{ backgroundColor: theme.primary, color: theme.white }}
                    className="py-3 rounded-lg mb-3"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? "Sending..." : "Send OTP"}
                  </button>

                  <input
                    name="otp"
                    value={form.otp}
                    onChange={handleChange}
                    placeholder="Enter OTP"
                    maxLength="6"
                    className="border px-4 py-2 rounded-lg mb-3"
                  />

                  <button
                    type="submit"
                    style={{ backgroundColor: theme.primary, color: theme.white }}
                    className="py-3 rounded-lg"
                    disabled={isLoggingIn || form.otp.length !== 6}
                  >
                    {isLoggingIn ? "Verifying..." : "Verify & Login"}
                  </button>
                </>
              )}
            </>
          )}

          {/* ================= SIGNUP STEP 2 (VERIFY OTP) ================= */}
          {step === 2 && authMode === "signup" && (
            <>
              <p className="text-sm text-gray-500 mb-3">
                Verify your email with OTP
              </p>

              <input
                name="otp"
                value={form.otp}
                onChange={handleChange}
                placeholder="Enter OTP"
                maxLength="6"
                className="border px-4 py-2 rounded-lg mb-3"
              />

              <button
                type="button"
                onClick={resendOtp}
                className="text-sm text-green-600 hover:text-green-700 font-medium mb-3"
                disabled={isLoggingIn}
              >
                Resend OTP
              </button>

              <button
                type="submit"
                style={{ backgroundColor: theme.primary, color: theme.white }}
                className="py-3 rounded-lg font-semibold"
                disabled={isLoggingIn || form.otp.length !== 6}
              >
                {isLoggingIn ? "Verifying..." : "Verify & Create Account"}
              </button>
            </>
          )}

          {/* Error Messages */}
          {errors && (
            <div className="mt-3 space-y-1">
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              {errors.otp && <p className="text-red-500 text-sm">{errors.otp}</p>}
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              {errors.api && <p className="text-red-500 text-sm font-semibold">{errors.api}</p>}
            </div>
          )}
        </form>
      </div>
    </div>,
    document.getElementById("modal-root")
  ) : null;
}
