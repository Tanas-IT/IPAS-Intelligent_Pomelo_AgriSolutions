import style from "./Authentication.module.scss";
import { Button } from "antd";
import { Loading, SignIn, SignUp } from "@/components";
import { useLocation, useNavigate } from "react-router-dom";
import { logo } from "@/assets/images/images";
import { GoogleCredentialResponse, GoogleOAuthProvider } from "@react-oauth/google";
import { authService } from "@/services";
import { PATHS } from "@/routes";
import { toast } from "react-toastify";
import { useLocalStorage, useToastMessage } from "@/hooks";
import { getRoleId } from "@/utils";
import { UserRole } from "@/constants";
import { useState } from "react";

function Authentication() {
  useToastMessage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const params = new URLSearchParams(location.search);
  const isSignUp = params.get("mode") === "sign-up";
  const toggleForm = () => {
    navigate(`/auth?mode=${isSignUp ? "sign-in" : "sign-up"}`);
  };

  const handleGoogleLoginSuccess = async (response: GoogleCredentialResponse) => {
    try {
      if (response.credential) {
        setIsLoading(true);
        var result = await authService.loginGoogle(response.credential);

        if (result.statusCode === 200) {
          const { saveAuthData } = useLocalStorage();
          const accessToken = result.data.authenModel.accessToken;

          const loginResponse = {
            accessToken: accessToken,
            refreshToken: result.data.authenModel.refreshToken,
            fullName: result.data.fullname,
            avatar: result.data.avatar,
          };

          saveAuthData(loginResponse);
          const toastMessage = result.message;
          const roleId = getRoleId();

          if (roleId === UserRole.User.toString())
            navigate(PATHS.FARM_PICKER, { state: { toastMessage } });
          if (roleId === UserRole.Admin.toString())
            navigate(PATHS.USER.USER_LIST, { state: { toastMessage } });
        } else {
          toast.error(result.message);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className={`${style.container} ${isSignUp ? style.active : ""}`} id="container">
      <a href="/">
        <img
          className={style.img}
          style={{
            width: "50px",
            cursor: "pointer",
            position: "fixed",
            zIndex: 1000,
            margin: "15px",
          }}
          src={logo}
          alt="IPAS Logo"
        />
      </a>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID}>
        <SignUp
          toggleForm={toggleForm}
          isSignUp={isSignUp}
          handleGoogleLoginSuccess={handleGoogleLoginSuccess}
        />
        <SignIn
          toggleForm={toggleForm}
          isSignUp={isSignUp}
          handleGoogleLoginSuccess={handleGoogleLoginSuccess}
        />
      </GoogleOAuthProvider>
      ,{/* Toggle */}
      <div className={style["toggle-container"]}>
        <div className={style.toggle}>
          <div className={`${style["toggle-panel"]} ${style["toggle-left"]}`}>
            <div className={style.customShapeDivider}>
              <svg
                data-name="Layer 1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                  opacity=".25"
                  className="shape-fill"
                ></path>
                <path
                  d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
                  opacity=".5"
                  className="shape-fill"
                ></path>
                <path
                  d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
                  className="shape-fill"
                ></path>
              </svg>
            </div>
            <h1>Welcome Back!</h1>
            <p>Enter your personal details to use all of site features</p>
            <Button className={style.hidden} onClick={toggleForm}>
              Sign In
            </Button>
          </div>
          <div className={`${style["toggle-panel"]} ${style["toggle-right"]}`}>
            <h1>Hi there!</h1>
            <p>
              Register with your personal details to become an owner to use all of site features
            </p>
            <Button className={style.hidden} onClick={toggleForm}>
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Authentication;
