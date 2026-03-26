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
  const [authMode, setAuthMode] = useState("login"); // login | signup | forgot
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
    mobile: "",
  });

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

  // 1=email, 2=password/name, 3=otp verification
  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
        newErrors.email = "Valid email required";
      }

      if (authMode === "signup") {
        if (!form.mobile || form.mobile.length !== 10) {
          newErrors.mobile = "Valid 10 digit mobile required";
        }
      }
    }

    if (step === 2 && authMode === "login") {
      if (loginType === "password") {
        if (!form.password || form.password.length < 5) {
          newErrors.password = "Password must be at least 5 characters";
        }
      }
    }

    if (step === 2 && authMode === "signup") {
      if (!form.name) newErrors.name = "Name required";
      if (!form.password || form.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
    }

    if (step === 3 && authMode === "signup") {
      if (!form.otp || form.otp.length !== 6) {
        newErrors.otp = "Enter valid 6-digit OTP";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const signup = async () => {
    try {
      setIsLoggingIn(true);
      setErrors({});

      const success = await zustandRegister(form.name, form.email, form.password, form.mobile);

      if (success) {
        onSuccess();
        onClose();
      } else {
        setErrors({ api: "Registration failed. Please try again." });
      }
    } catch (err) {
      console.error("Signup failed:", err);
      setErrors({ api: "Registration failed. Please try again." });
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
        setForm({ name: "", email: "", password: "", otp: "", mobile: "" });
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

            if (!validateStep()) return;

            // LOGIN FLOW
            if (authMode === "login") {
              if (step === 1) {
                setStep(2);
                return;
              }

              if (step === 2 && loginType === "password") {
                login();
                return;
              }

              if (step === 2 && loginType === "otp") {
                // OTP login logic
                return;
              }
            }

            // SIGNUP FLOW
            if (authMode === "signup") {
              if (step === 1) {
                setStep(2);
                return;
              }

              if (step === 2) {
                setStep(3);
                return;
              }

              if (step === 3) {
                signup();
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
              }}
              style={{
                backgroundColor: authMode === "login" ? theme.primary : theme.secondary,
                color: authMode === "login" ? theme.white : theme.dark,
              }}
              className="flex-1 py-2 rounded-lg w-auto cursor-pointer"
            >
              &lt;
            </div>}

            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setLoginType("password");
                setStep(1);
                setErrors({});
              }}
              style={{
                backgroundColor: authMode === "login" ? theme.primary : theme.secondary,
                color: authMode === "login" ? theme.white : theme.dark,
              }}
              className="flex-1 py-2 rounded-lg"
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode("signup");
                setLoginType("password");
                setStep(1);
                setErrors({});
              }}
              style={{
                backgroundColor: authMode === "signup" ? theme.primary : theme.secondary,
                color: authMode === "signup" ? theme.white : theme.dark,
              }}
              className="flex-1 py-2 rounded-lg"
            >
              Sign Up
            </button>
          </div>

          {/* ================= STEP 1 EMAIL ================= */}
          {step === 1 && (
            <>
              {/* <label>Email</label> */}
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
              ) :
                <input
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  className="border px-4 py-2 rounded-lg mb-4"
                  placeholder="Enter mobile number"
                  type="text"
                  maxLength={10}
                  minLength={10}
                />
              }

              <button
                type="submit"
                style={{ backgroundColor: theme.primary, color: theme.white }}
                className="py-3 rounded-lg"
              >
                Continue
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
                    style={{ backgroundColor: theme.primary, color: theme.white }}
                    className="py-3 rounded-lg mb-3"
                  >
                    Send OTP
                  </button>

                  <input
                    name="otp"
                    value={form.otp}
                    onChange={handleChange}
                    placeholder="Enter OTP"
                    className="border px-4 py-2 rounded-lg mb-3"
                  />

                  <button
                    type="submit"
                    style={{ backgroundColor: theme.primary, color: theme.white }}
                    className="py-3 rounded-lg"
                  >
                    Verify & Login
                  </button>
                </>
              )}
            </>
          )}

          {/* ================= SIGNUP STEP 2 (NAME + PASSWORD) ================= */}
          {step === 2 && authMode === "signup" && (
            <>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="border px-4 py-2 rounded-lg mb-3"
              />

              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                type="password"
                placeholder="Create Password"
                className="border px-4 py-2 rounded-lg mb-3"
              />

              <button
                type="submit"
                style={{ backgroundColor: theme.primary, color: theme.white }}
                className="py-3 rounded-lg"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? <>Logging in..</> : <>Continue to Verify Email</>}
              </button>
            </>
          )}

          {/* ================= SIGNUP STEP 3 (MANDATORY OTP) ================= */}
          {step === 3 && authMode === "signup" && (
            <>
              <p className="text-sm text-gray-500 mb-2">
                Verify your email with OTP
              </p>

              <button
                style={{ backgroundColor: theme.primary, color: theme.white }}
                className="py-3 rounded-lg mb-3"
              >
                Send OTP
              </button>

              <input
                name="otp"
                value={form.otp}
                onChange={handleChange}
                placeholder="Enter OTP"
                className="border px-4 py-2 rounded-lg mb-3"
              />

              <button
                type="submit"
                style={{ backgroundColor: theme.primary, color: theme.white }}
                className="py-3 rounded-lg font-semibold"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "Verifying... and Creating Account" : "Verify & Create Account"}
              </button>
            </>
          )}
          {errors && (
            <>
              <p className="text-red-500 text-sm mb-3">{errors.email}</p>
              <p className="text-red-500 text-sm mb-3">{errors.password}</p>
              <p className="text-red-500 text-sm mb-3">{errors.otp}</p>
              <p className="text-red-500 text-sm mb-3">{errors.name}</p>
              <p className="text-red-500 text-sm mb-3">{errors.mobile}</p>
              <p className="text-red-500 text-sm mb-3">{errors.api}</p>
            </>
          )}
        </form>
      </div>
    </div >,
    document.getElementById("modal-root")
  ) : null;
}
