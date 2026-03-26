import React, { useEffect, useState } from "react";
import LocationSearch from "./LocationSearch";
import LoginModal from "./LoginModal.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore.js";
import { ChevronDown, LogOut, LayoutDashboard } from "lucide-react";


function Header({ hideLocationSearch = false }) {
  const [location, setLocation] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuthStore();

  const locationHook = useLocation();
  const navigate = useNavigate();

  // Close mobile menu on route change temporarily disable login
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [locationHook.pathname]);

  // Check login state
  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);

  const handleLoginSuccess = () => {
    // Call initAuth to sync with localStorage
    const { initAuth } = useAuthStore.getState();
    initAuth();
    setShowLogin(false);
    window.location.reload(); // Reload to ensure all components sync
  };

  return (
    <div className="
      sticky top-0 z-50 rounded-b-xl
      backdrop-blur-md bg-white/70
      border border-gray-200
      text-gray-800
    ">
      {/* Login Modal */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={handleLoginSuccess}
      />
      {/* <div className="sticky top-2 z-50 rounded-b-xl glassmorphism relative overflow-hidden text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"> */}
      <div className="absolute inset-0 bg-black/0.1 pointer-events-none"></div>
      <div className="relative max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-10">
          <div className="flex items-center  cursor-pointer" onClick={() => navigate('/')}>
            <div className="text-green-600 font-extrabold text-2xl tracking-wide">SP</div>
            <img
              className="rounded-xs object-cover w-4.5"
              src="https://playo-website.gumlet.io/playo-website-v3/hero/hero_playo_logo.png?q=90"
            ></img>
            <div className="text-green-600 font-extrabold text-2xl tracking-wide">RTIFY</div>
          </div>
          {/* LOCATION SEARCH – DESKTOP ONLY */}
          <div className="hidden md:block">
            {hideLocationSearch && (
              <LocationSearch location={location} setLocation={setLocation} />
            )}
          </div>
          <div className="flex gap-8 text-sm font-medium hidden md:flex gap-6 text-sm font-medium">
            <div className="flex items-center px-3 py-1 rounded-full  cursor-pointer" onClick={() => navigate('/games')}>
              <div className="text-green-600">
                <svg
                  width="1.7rem"
                  height="1.7rem"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    opacity="0.2"
                    d="M11.875 4.375C11.875 4.74584 11.765 5.10835 11.559 5.41669C11.353 5.72504 11.0601 5.96536 10.7175 6.10727C10.3749 6.24919 9.99792 6.28632 9.63421 6.21397C9.27049 6.14163 8.9364 5.96305 8.67418 5.70083C8.41195 5.4386 8.23338 5.10451 8.16103 4.74079C8.08868 4.37708 8.12581 4.00008 8.26773 3.65747C8.40964 3.31486 8.64996 3.02202 8.95831 2.81599C9.26665 2.60997 9.62916 2.5 10 2.5C10.4973 2.5 10.9742 2.69754 11.3258 3.04917C11.6775 3.40081 11.875 3.87772 11.875 4.375Z"
                    fill="#43A047"
                  ></path>
                  <path
                    d="M10.0005 6.875C10.495 6.875 10.9783 6.72838 11.3895 6.45368C11.8006 6.17897 12.121 5.78853 12.3102 5.33171C12.4994 4.8749 12.549 4.37223 12.4525 3.88728C12.356 3.40232 12.1179 2.95687 11.7683 2.60723C11.4187 2.2576 10.9732 2.0195 10.4883 1.92304C10.0033 1.82657 9.50064 1.87608 9.04382 2.0653C8.58701 2.25452 8.19656 2.57495 7.92186 2.98608C7.64715 3.3972 7.50053 3.88055 7.50053 4.375C7.50053 5.03804 7.76392 5.67393 8.23276 6.14277C8.7016 6.61161 9.33749 6.875 10.0005 6.875ZM10.0005 3.125C10.2478 3.125 10.4894 3.19831 10.695 3.33566C10.9006 3.47302 11.0608 3.66824 11.1554 3.89665C11.25 4.12505 11.2747 4.37639 11.2265 4.61886C11.1783 4.86134 11.0592 5.08407 10.8844 5.25888C10.7096 5.4337 10.4869 5.55275 10.2444 5.60098C10.0019 5.64921 9.75058 5.62446 9.52218 5.52985C9.29377 5.43524 9.09854 5.27503 8.96119 5.06946C8.82384 4.8639 8.75053 4.62223 8.75053 4.375C8.75053 4.04348 8.88223 3.72554 9.11665 3.49112C9.35107 3.2567 9.66901 3.125 10.0005 3.125ZM3.75053 7.5C3.75053 7.25278 3.82384 7.0111 3.96119 6.80554C4.09854 6.59998 4.29377 6.43976 4.52218 6.34515C4.75058 6.25054 5.00192 6.22579 5.24439 6.27402C5.48687 6.32225 5.7096 6.4413 5.88441 6.61612C6.05923 6.79093 6.17828 7.01366 6.22651 7.25614C6.27474 7.49862 6.24999 7.74995 6.15538 7.97836C6.06077 8.20676 5.90055 8.40199 5.69499 8.53934C5.48943 8.67669 5.24776 8.75 5.00053 8.75C4.66901 8.75 4.35107 8.61831 4.11665 8.38388C3.88223 8.14946 3.75053 7.83152 3.75053 7.5ZM17.363 8.64141C17.2596 8.77087 17.109 8.85396 16.9443 8.87242C16.7797 8.89088 16.6144 8.84319 16.4849 8.73985C16.3951 8.67031 14.6326 7.35703 11.8505 8.7875C11.8286 9.58242 11.7503 10.3748 11.6162 11.1586L14.1497 13.268C14.2464 13.3485 14.3166 13.4562 14.351 13.5772C14.3854 13.6982 14.3825 13.8268 14.3427 13.9461L13.0927 17.6961C13.0403 17.8534 12.9275 17.9834 12.7793 18.0575C12.631 18.1316 12.4594 18.1438 12.3021 18.0914C12.1448 18.039 12.0148 17.9262 11.9407 17.778C11.8666 17.6297 11.8544 17.458 11.9068 17.3008L13.0216 13.9555L11.2966 12.518C11.1839 12.898 11.0509 13.2717 10.8982 13.6375C9.82397 16.1953 7.89975 17.9055 5.17944 18.7219C5.02204 18.7652 4.85394 18.7452 4.71109 18.6662C4.56824 18.5871 4.46198 18.4554 4.41503 18.299C4.36808 18.1427 4.38417 17.9741 4.45986 17.8295C4.53556 17.6848 4.66484 17.5756 4.82006 17.525C9.56069 16.1023 10.3779 11.8828 10.556 9.5836C8.43803 10.9281 6.76381 11.25 5.65365 11.25C5.1307 11.2518 4.61119 11.1654 4.11694 10.9945C3.98473 10.9368 3.87658 10.835 3.81084 10.7066C3.7451 10.5782 3.72582 10.4309 3.75627 10.2899C3.78672 10.1489 3.86502 10.0227 3.9779 9.93287C4.09077 9.843 4.23126 9.79495 4.37553 9.79688C4.46486 9.79675 4.55313 9.81622 4.63412 9.85391C4.63412 9.85391 6.72475 10.6883 10.274 8.27578C14.3591 5.49922 17.149 7.66875 17.2669 7.7625C17.331 7.81389 17.3843 7.87739 17.4238 7.94937C17.4632 8.02136 17.4882 8.10042 17.4971 8.18205C17.506 8.26367 17.4988 8.34624 17.4758 8.42506C17.4528 8.50388 17.4145 8.5774 17.363 8.64141Z"
                    fill="#43A047"
                  ></path>
                </svg>
              </div>
              <span className="cursor-pointer font-black ml-1">Play</span>
            </div>
            <div className="flex items-center px-3 py-1 rounded-full  cursor-pointer" onClick={() => navigate('/venues')}>
              <div className="text-green-600">
                <svg
                  width="1.7rem"
                  height="1.7rem"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    opacity="0.2"
                    d="M4.69687 4.69453C5.39123 3.99919 6.21579 3.44748 7.12344 3.07093C8.0311 2.69438 9.00406 2.50038 9.98672 2.5C9.98279 4.48382 9.19255 6.38517 7.78919 7.78736C6.38583 9.18955 4.48382 9.9782 2.5 9.98047C2.50077 8.99824 2.6952 8.02579 3.07217 7.11878C3.44913 6.21176 4.00123 5.38797 4.69687 4.69453ZM12.2094 12.2016C11.5136 12.8947 10.9615 13.7184 10.5846 14.6253C10.2078 15.5322 10.0136 16.5046 10.0133 17.4867C11.9967 17.4832 13.898 16.6942 15.3011 15.2922C16.7042 13.8903 17.4948 11.9897 17.5 10.0063C16.5172 10.0068 15.5441 10.201 14.6363 10.5777C13.7286 10.9544 12.9039 11.5062 12.2094 12.2016Z"
                    fill="#43A047"
                  ></path>
                  <path
                    d="M15.7491 4.25469C14.6128 3.11841 13.165 2.3446 11.5889 2.03111C10.0129 1.71762 8.3792 1.87853 6.89456 2.4935C5.40992 3.10847 4.14098 4.14987 3.2482 5.48602C2.35542 6.82216 1.87891 8.39304 1.87891 10C1.87891 11.607 2.35542 13.1778 3.2482 14.514C4.14098 15.8501 5.40992 16.8915 6.89456 17.5065C8.3792 18.1215 10.0129 18.2824 11.5889 17.9689C13.165 17.6554 14.6128 16.8816 15.7491 15.7453C16.5092 14.994 17.1127 14.0993 17.5246 13.1131C17.9364 12.1269 18.1485 11.0688 18.1485 10C18.1485 8.93124 17.9364 7.8731 17.5246 6.88689C17.1127 5.90068 16.5092 5.006 15.7491 4.25469ZM5.13814 5.13828C6.26312 4.01178 7.74553 3.31257 9.33033 3.16094C9.17758 4.74567 8.47531 6.22705 7.34517 7.34844C6.22227 8.47658 4.74059 9.17708 3.15611 9.32891C3.30904 7.74396 4.00997 6.26198 5.13814 5.13828ZM3.1522 10.5844C5.07133 10.4311 6.87243 9.59681 8.23033 8.23204C9.59597 6.87457 10.4309 5.07333 10.5842 3.15391C12.2 3.28861 13.7157 3.99142 14.8625 5.1376C16.0092 6.28377 16.7128 7.79918 16.8483 9.41485C14.9299 9.57194 13.1295 10.405 11.768 11.7657C10.4065 13.1263 9.57223 14.9262 9.41392 16.8445C7.79819 16.7098 6.28243 16.007 5.13568 14.8608C3.98893 13.7147 3.28537 12.1993 3.14986 10.5836L3.1522 10.5844ZM14.8647 14.8617C13.7395 15.9879 12.2572 16.6871 10.6725 16.8391C10.8286 15.2556 11.5291 13.7752 12.6545 12.6505C13.78 11.5257 15.2608 10.8262 16.8444 10.6711C16.6921 12.2557 15.992 13.7377 14.8647 14.8617Z"
                    fill="#43A047"
                  ></path>
                </svg>
              </div>
              <span className="cursor-pointer font-black ml-1">Book</span>
            </div>
            <div className="flex items-center px-3 py-1 rounded-full  cursor-pointer" onClick={() => navigate('/trainers')}>
              <div className="text-green-600">
                <svg
                  width="1.7rem"
                  height="1.7rem"
                  viewBox="0 0 20 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className=" md:mt-1"
                >
                  <g clipPath="url(#clip0_1480_9064)">
                    <path
                      d="M 12,0 C 8.81853,0.00362476 5.76841,1.25533 3.51877,3.48052 1.26912,5.70571 0.00366459,8.72267 0,11.8696 v 6.3913 C 0,18.9873 0.291757,19.684 0.811089,20.1977 1.33042,20.7114 2.03479,21 2.76923,21 3.3575,20.999 3.93033,20.8136 4.40538,20.4704 5.80731,19.4627 8.26154,18.2609 12,18.2609 c 3.7385,0 6.1927,1.2006 7.5935,2.2084 0.4126,0.2992 0.901,0.4795 1.411,0.5209 0.5099,0.0413 1.0215,-0.0578 1.4779,-0.2866 0.4564,-0.2287 0.8398,-0.5781 1.1077,-1.0093 C 23.858,19.2631 23.9999,18.767 24,18.2609 V 11.8696 C 23.9963,8.72267 22.7309,5.70571 20.4812,3.48052 18.2316,1.25533 15.1815,0.00362476 12,0 Z m 10.1538,11.8696 v 1.0123 C 20.6815,11.9807 19.0924,11.2812 17.43,10.8024 17.0729,7.65415 15.928,4.64356 14.0988,2.04293 c 2.2768,0.47902 4.3185,1.71594 5.7844,3.50431 1.466,1.78837 2.2675,4.01998 2.2706,6.32236 z M 12,2.31342 c 1.8432,2.34091 3.0507,5.10913 3.5077,8.04168 -2.3212,-0.41547 -4.6989,-0.41547 -7.02001,0 C 8.95017,7.4233 10.1588,4.65603 12,2.31342 Z M 9.90115,2.04293 C 8.07186,4.64389 6.92695,7.65489 6.57,10.8036 4.9076,11.2824 3.31851,11.9819 1.84615,12.883 V 11.8696 C 1.84935,9.56722 2.65081,7.33561 4.11676,5.54724 5.58271,3.75887 7.62444,2.52195 9.90115,2.04293 Z M 21.6531,19.0723 c -0.1535,0.0784 -0.3262,0.1125 -0.4983,0.0986 -0.1722,-0.014 -0.337,-0.0754 -0.4756,-0.1773 C 19.0569,17.8272 16.2346,16.4348 12,16.4348 c -4.23462,0 -7.05692,1.3924 -8.67923,2.5588 C 3.18215,19.0955 3.0174,19.1569 2.84524,19.1709 2.67309,19.1848 2.50044,19.1507 2.34692,19.0723 2.19419,18.998 2.06599,18.8823 1.97731,18.7386 1.88864,18.5949 1.84314,18.4292 1.84615,18.2609 V 15.0732 C 4.81292,12.9896 8.36142,11.8702 12,11.8702 c 3.6386,0 7.1871,1.1194 10.1538,3.203 v 3.1877 c 0.0031,0.1683 -0.0424,0.334 -0.1311,0.4777 -0.0887,0.1437 -0.2169,0.2594 -0.3696,0.3337 z"
                      fill="#43A047"
                      id="path2"
                    ></path>
                  </g>
                  <defs>
                    <clipPath id="clip0_1480_9064">
                      <rect
                        width="32"
                        height="32"
                        fill="white"
                        transform="translate(0.166016)"
                      ></rect>
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <span className="cursor-pointer font-black ml-1">Train</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm font-semibold">
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <img
                  src={user?.profileLink || `https://robohash.org/${user?.name?.replaceAll(' ', '-')}`}
                  className="w-8 h-8 rounded-full object-cover"
                  alt="profile"
                />
                <span className="hidden md:block text-gray-700">{user?.name}</span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-40">
                  {/* <div className="p-4 border-b">
                    <p className="font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                    <p className="text-xs text-green-600 mt-1">Role: {user?.role}</p>
                  </div> */}

                  <div className="py-2">
                    <button
                      onClick={() => {
                        navigate("/myprofile");
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                    >
                      My Profile
                    </button>

                    {user?.role === 'ADMIN' && (
                      <button
                        onClick={() => {
                          navigate("/admin-dashboard");
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Dashboard
                      </button>
                    )}
                  </div>

                  <div className="border-t p-2">
                    <button
                      onClick={() => {
                        logout();
                        navigate('/');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLogin(true)}
                className="hidden md:block px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg font-medium"
              >
                Login
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="hidden md:block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* MOBILE MENU */}
          <button
            className="md:hidden p-2 !bg-transparent"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Open menu"
          >
            <svg
              className="w-7 h-7"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="3"
                y1="12"
                x2="21"
                y2="12"
                style={{
                  fill: "none",
                  stroke: "rgb(0, 181, 98)",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                }}
              />
              <path
                d="M9,18H21M3,6H15"
                style={{
                  fill: "none",
                  stroke: "rgb(0, 0, 0)",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                }}
              />
            </svg>
          </button>

          {/* MOBILE MENU DROPDOWN */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-lg z-40">
              <div className="flex flex-col px-6 py-4 gap-4 text-sm font-medium">
                <div
                  className="cursor-pointer p-0.5 hover:bg-gray-100"
                  onClick={() => {
                    navigate("/games");
                    setMobileMenuOpen(false);
                  }}
                >
                  Play
                </div>

                <div
                  className="cursor-pointer p-0.5 hover:bg-gray-100"
                  onClick={() => {
                    navigate("/venues");
                    setMobileMenuOpen(false);
                  }}
                >
                  Book
                </div>

                <div
                  className="cursor-pointer p-0.5 hover:bg-gray-100"
                  onClick={() => {
                    navigate("/trainers");
                    setMobileMenuOpen(false);
                  }}
                >
                  Train
                </div>

                {isLoggedIn ? (
                  <>
                    <div className="border-t pt-4">
                      <div className="cursor-pointer p-0.5 hover:bg-gray-100" onClick={() => {
                        navigate("/myprofile");
                        setMobileMenuOpen(false);
                      }}>
                        My Profile
                      </div>
                    </div>

                    {user?.role === 'ADMIN' && (
                      <div className="cursor-pointer text-blue-600 p-0.5 hover:bg-blue-50" onClick={() => {
                        navigate("/admin-dashboard");
                        setMobileMenuOpen(false);
                      }}>
                        Admin Dashboard
                      </div>
                    )}

                    <div className="cursor-pointer text-red-600 p-0.5 hover:bg-red-50" onClick={() => {
                      logout();
                      navigate('/');
                      setMobileMenuOpen(false);
                    }}>
                      Logout
                    </div>
                  </>
                ) : (
                  <>
                    <div className="border-t pt-4 flex flex-col gap-2">
                      <button onClick={() => {
                        setShowLogin(true);
                        setMobileMenuOpen(false);
                      }} className="w-full px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg font-medium text-left">
                        Login
                      </button>
                      <button onClick={() => {
                        setShowLogin(true);
                        setMobileMenuOpen(false);
                      }} className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">
                        Sign Up
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
