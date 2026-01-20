import ReactDOM from "react-dom";
import login_bg from "../assets/login_bg.png";
import login_top from "../assets/login-top.png";

export default function LoginModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      {/* Modal Box */}
      <div className="bg-white w-[900px] h-[550px] rounded-2xl overflow-hidden flex">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-black"
        >
          ✕
        </button>

        {/* Left Image Section */}
        {/* <div className="w-1/2 md:block">
          <img
            src={login_top}
            className="w-full h-full object-cover"
            alt="map"
          />
        </div> */}
        <div className="hidden md:block w-1/2 relative overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${login_bg})` }}
          />

          {/* Top Image */}
          <img
            src={login_top}
            className="relative z-10 w-full h-full object-contain"
            alt="overlay"
          />
        </div>

        {/* Right Form Section */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Login / Sign Up</h2>

          <label className="text-sm font-medium mb-2 text-gray-800">
            Enter Email <span className="text-red-500">*</span>
          </label>

          <div className="flex gap-2 mb-4">
            {/* <div className="border rounded-lg px-3 py-2 flex items-center gap-2">
              🇮🇳 <span>+91</span>
            </div> */}
            <input
              type="email"
              placeholder="Enter your email"
              className="border rounded-lg px-4 py-2 flex-1 outline-none focus:ring-2 focus:ring-green-500 text-gray-500"
            />
          </div>

          <button className="bg-gray-200 text-gray-500 py-3 rounded-lg cursor-not-allowed">
            Send OTP
          </button>

          <div className="text-center my-6 text-gray-400">Or</div>

          <div className="flex gap-4">
            <button className="flex-1 border rounded-lg py-3 flex items-center justify-center gap-2 hover:bg-gray-50">
              📧 Email Id
            </button>

            <button className="flex-1 border rounded-lg py-3 flex items-center justify-center gap-2 hover:bg-gray-50">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                className="w-5"
                alt="google"
              />
              Google
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}
