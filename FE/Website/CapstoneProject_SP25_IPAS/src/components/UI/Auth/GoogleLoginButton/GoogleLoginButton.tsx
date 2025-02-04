import React from "react";
import { GoogleLogin, GoogleCredentialResponse } from "@react-oauth/google";

type GoogleLoginButtonProps = {
  onSuccess: (response: GoogleCredentialResponse) => void;
  onError?: () => void;
};

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onSuccess, onError }) => {
  return (
    <GoogleLogin
      // theme="filled_blue"
      onSuccess={onSuccess}
      onError={onError || (() => console.error("Google Sign-In Failed"))}
    />
  );
};

export default GoogleLoginButton;
