import React, { useState } from "react";
import { useAuth } from "../../Contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import CustomNavbar from "../Layouts/CustomNavbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import HeroSection from "../../assets/Images/TLBCSlider2.png";
import Logo from "../../assets/Images/TLBC_LOGO_removebg.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleBackToHome = () => {
    navigate("/");
  };

  const onForgotPassword = () => {
    navigate("/forgotpassword");
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error logging in:", error);
      const errorMessage = extractErrorCode(error.message);
      alert("Failed to log in: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  function extractErrorCode(errorMessage) {
    const match = errorMessage.match(/\(auth\/([^\)]+)\)/);
    return match ? match[1] : errorMessage;
  }

  return (
    <>
      <CustomNavbar />

      <div
        className="d-flex flex-column align-items-center justify-content-center min-vh-100 text-white"
        style={{
          backgroundImage: `url(${HeroSection})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          padding: "1rem",
        }}
      >
          <div
            className=" container-fluid w-100 mx-auto p-3 p-sm-4 bg-white rounded shadow-lg"
            style={{ maxWidth: "28rem" }}
          >
            {/* <div className="bg-white p-4 p-sm-5 rounded shadow"> */}
              <div className="text-center">
                <img
                  src={Logo}
                  alt="TLBC Logo"
                  className="mb-4"
                  style={{ height: "4rem", width: "auto" }}
                />
                <h2 className="h3 mb-2 text-dark font-weight-bold">
                  Welcome to TLBC
                </h2>
                <p className="text-muted mb-0">
                  Please login to access your account.
                </p>
              </div>

              <form className="w-100 mx-auto" onSubmit={handleSubmit}>
                <div className="position-relative mb-3">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="form-control ps-1"
                  />
                </div>

                <div className="position-relative mt-3 mb-3">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    className="form-control ps-1 pe-5"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    style={{ paddingRight: "40px" }} //Add padding to prevent text overlap with the icon
                  />
                  <div
                    className="input-group-append position-absolute end-0 top-50 translate-middle-y"
                    style={{ zIndex: 10, paddingRight: "10px" }}
                  >
                    <button
                      type="button"
                      className="btn btn-link position-absolute top-50 end-0 pe-4 translate-middle-y bg-transparent border-0"
                      onClick={togglePasswordVisibility}
                      style={{
                        border: "none",
                        background: "transparent",
                        padding: 0,
                      }}
                    >
                      <FontAwesomeIcon
                        icon={passwordVisible ? faEyeSlash : faEye}
                        className="text-muted"
                        style={{
                          color: "#6c757d",
                          height: "1.25rem",
                          width: "1.25rem",
                        }}
                      />
                    </button>
                  </div>
                </div>
                <div className="d-flex justify-content-end align-items-end">
                  <div className="text-muted small">
                    <button
                      type="button"
                      onClick={onForgotPassword}
                      className="btn btn-link text-decoration-none text-primary font-weight-bold"
                    >
                      Forgot password?
                    </button>
                  </div>
               </div>

                <div className="d-grid mb-1">
                  <button
                    type="submit"
                    className="btn w-100 py-2"
                    style={{
                      height: "3em",
                      backgroundColor: isHovered ? "#cc8a00" : "#ffc107",
                      color: isHovered ? "white" : "black",
                      fontSize: "1.1em",
                      fontWeight: "bolder",
                      border: "none",
                      transition: "background-color 0.3s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </button>
                </div>
              </form>

          </div>
        </div>
    </>
  );
}

export default Login;
