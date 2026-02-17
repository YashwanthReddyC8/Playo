import React, { useState } from "react";
import ReactDOM from "react-dom";
import login_bg from "../assets/login_bg.png";
import login_top from "../assets/login-top.png";
import axiosInstance from "../api/axios";

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const [authMode, setAuthMode] = useState("login"); // login | signup
  const [loginType, setLoginType] = useState("password"); // password | otp
  const [step, setStep] = useState(1);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  // 1=email, 2=password/name, 3=otp verification

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

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const login = async () => {
    try {
      setIsLoggingIn(true);

      const res = await axiosInstance.post("/api/auth/login", {
        email: form.email,
        password: form.password,
      });

      console.log("Login response:", res.data);

      const userData = {
        name: res.data.user?.name,
        email: res.data.user?.email,
        mobile: res.data.user?.phone,
        image: (res.data.user?.profileLink !== null && res.data.user?.profileLink !== undefined) ? res.data.user.profileLink : `https://robohash.org/${res.data.user?.name?.replaceAll(" ", "-")}`,
      };

      localStorage.setItem("email", userData.email);
      localStorage.setItem("name", userData.name);
      localStorage.setItem("image", userData.image);
      localStorage.setItem("mobile", userData.mobile || "");
      localStorage.setItem("spj", res.data.token);
      console.log("User logged in:", userData);
      onSuccess(userData);
      onClose();

    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const signup = async () => {
    try {
      setIsLoggingIn(true);

      const res = await axiosInstance.post("/api/auth/register", {
        name: form.name,
        email: form.email,
        phone: form.mobile,
        password: form.password,
      });

      const fallbackImage = `https://robohash.org/${form?.name?.replaceAll(" ", "-")}`;
      const userData = {
        ...form,
        image: res.data.user?.profileLink || fallbackImage,
      };

      localStorage.setItem("name", form.name);
      localStorage.setItem("email", form.email);
      localStorage.setItem("mobile", form.mobile || "");
      localStorage.setItem("image", userData.image);
      localStorage.setItem("spj", res.data.token);

      onSuccess(userData);
      onClose();

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="bg-white w-[900px] h-[550px] rounded-2xl overflow-hidden flex relative">

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
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">

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
              onClick={() => {
                setAuthMode("login");
                setStep(1);
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
              onClick={() => {
                setAuthMode("signup");
                setStep(1);
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
                onClick={() => setStep(2)}
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

                  <div
                    onClick={login}
                    style={{ backgroundColor: theme.primary, color: theme.white }}
                    className="cursor-pointer py-3 rounded-lg"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? "Logging in..." : "Login"}
                  </div>
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
                onClick={() => setStep(3)}
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
                onClick={signup}
                style={{ backgroundColor: theme.primary, color: theme.white }}
                className="py-3 rounded-lg font-semibold"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "Verifying... and Creating Account" : "Verify & Create Account"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}
