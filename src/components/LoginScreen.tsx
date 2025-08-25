/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useEffect, useRef, useState } from "react";
import { GetAsync_with_token, PostAsync } from "../services/rest_api_service";
import { decodeBase64, encodeBase64 } from "../utils/securedata";
//import { AppImages } from "../assets";
const BASE_URL = import.meta.env.VITE_BASE_URL;
const APP_URL = import.meta.env.VITE_BASE_APP_URL;
import ForgeLogoVertical from "@/assets/img/ForgeLogoVertical.png";
import CryptoJS from "crypto-js";
import { jwtDecode } from "jwt-decode";
import { forgotPassword } from "../utils/password";
import AlertBox from "../components/ui/AlertBox";
import { Eye_svg, Pencil_svg } from "../assets/Icons";

// import Register from "./Register";
import { fetchAndStoreLabels } from "../services/labelService";
import { useNavigate } from "react-router-dom";

export type HomeStackNavigatorParamList = {
  LoginScreen: {};
  WelcomeScreen: {};
  Main: undefined;
  SignupScreen: undefined;
};

declare global {
  interface Window {
    Tawk_API?: {
      setAttributes: (
        attributes: { name?: string; email?: string; userId?: string },
        callback?: (error?: any) => void
      ) => void;
      onLoad?: () => void;
      maximize?: () => void;
      endChat?: () => void;
      [key: string]: any;
    };
  }
}
interface LoginProps {
  str?: string;
}
const LoginScreen: React.FC<LoginProps> = ({ str }) => {
  const [email, setEmail] = useState<string>("");
  const [forgotScreenEmail, setForgotScreenEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [otp, setOtp] = useState<string>(""); // New state for OTP input
  const [isMfaEnabled, setIsMfaEnabled] = useState<boolean>(false); // New state for MFA status
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false); // Track if OTP was sent
  const navigation = useNavigate();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  let tempErrors: { [key: string]: string } = {};
  const [authUrl, setAuthUrl] = useState<string>("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isEmailEditable, setIsEmailEditable] = useState<boolean>(true);
  const [isOtpVerification, setIsOtpVerification] = useState<boolean>(false); // New state for OTP verification UI
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [oAuthConfig, setOAuthConfig] = useState<any>({});
  const [isRegistration, setIsRegistration] = useState(false);

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
    setAlertMessage("");
  };

  const handleForgotPassword = () => {
    setIsForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setIsOtpVerification(false);
    setIsMfaEnabled(false);
    setIsOtpSent(false);
    setOtp("");
    setIsEmailEditable(true);
  };

  const generatePKCEChallenge = () => {
    const codeVerifier = generateRandomString(128);
    const codeChallenge = generateCodeChallenge(codeVerifier);
    return { codeVerifier, codeChallenge };
  };

  const generateRandomString = (length: number) =>
    Array(length)
      .fill(0)
      .map(
        () =>
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"[
            Math.floor(Math.random() * 66)
          ]
      )
      .join("");

  const generateCodeChallenge = (codeVerifier: string) => {
    const hash = CryptoJS.SHA256(codeVerifier);
    return CryptoJS.enc.Base64.stringify(hash)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  const getLabelInfo = async (id: string, tokeninput: string) => {
    const uri = `${BASE_URL}/customeradmin/get_custom_labels?label_id=${id}`;
    try {
      const res = await GetAsync_with_token(uri, tokeninput);
      if (res.status === "success") {
        localStorage.setItem("labelData", JSON.stringify(res.data));
      }
    } catch (error) {
      console.error("Error parsing customer data:", error);
    }
  };
  const handleLogin = async () => {
    if (!email) tempErrors.email = "Email/User name is required";
    if (!password) tempErrors.password = "Password is required";
    setErrors(tempErrors);
    if (Object.keys(tempErrors).length > 0) return;

    const uri = `${BASE_URL}/auth/login`;
    // let hashedPassword = crypto
    //   .createHash('md5')
    //   .update(password)
    //   .digest('hex');

    const hash = CryptoJS.SHA256(password).toString();
    ////////debugger;
    const payload = JSON.stringify({ email: email, password: password });

    try {
      const jsonResult = await PostAsync(uri, payload);
      console.log("Login Response:", JSON.stringify(jsonResult, null, 2));
      if (jsonResult.status === "success") {
        const { accessToken, user, refreshToken } = jsonResult.data;
        const {
          userId,
          userrole,
          customer_id,
          company_name,
          firstName,
          lastName,
          source,
          file_name,
          permission_ids,
          login_history_id,
          landing_url,
          terms_accepted,
          multi_role_enabled,
        } = user;

        await storeUserData({
          email,
          userId,
          accessToken,
          refreshToken,
          customer_id,
          company_name,
          firstName,
          lastName,
          source,
          file_name,
          permission_ids,
          login_history_id,
          userrole,
          terms_accepted,
          multi_role_enabled,
        });

        const UserType = decodeBase64(localStorage.getItem("UserType") ?? "");
        navigation(landing_url);
        // if (UserType === '1' || userrole === 1) {
        //   localStorage.setItem('isAdmin', 'yes');
        //   navigate('Main', {screen: 'CustomerList'});
        // } else {
        //   navigate('Main', {screen: landing_url});
        // }
      } else {
        showAlert(jsonResult.message);
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  // New function to store user data (reused in handleLogin and verifyOtp)
  const storeUserData = async ({
    email,
    userId,
    accessToken,
    refreshToken,
    customer_id,
    company_name,
    firstName,
    lastName,
    source,
    file_name,
    permission_ids,
    login_history_id,
    userrole,
    terms_accepted,
    multi_role_enabled,
  }: {
    email: string;
    userId: string;
    accessToken: string;
    refreshToken: string;
    customer_id: string;
    company_name: string;
    firstName: string;
    lastName: string;
    source: string;
    file_name: string;
    permission_ids: any[];
    login_history_id: string;
    userrole: number;
    terms_accepted: boolean;
    multi_role_enabled: boolean;
  }) => {
    localStorage.setItem("UserEmail", encodeBase64(email.toLowerCase() || ""));
    localStorage.setItem("ID", encodeBase64(userId?.toString() || ""));
    localStorage.setItem("UserState", "AdminDboard");
    localStorage.setItem("Token", "Bearer " + accessToken);
    localStorage.setItem("refreshToken", refreshToken || "");
    localStorage.setItem("lastInteraction", Date.now().toString());
    //setIsAuthenticated(true);
    localStorage.setItem(
      "Customer_ID",
      encodeBase64(customer_id?.toString() || "")
    );
    localStorage.setItem("company_name", company_name || "");
    localStorage.setItem("firstName", firstName || "");
    localStorage.setItem("lastName", lastName || "");
    localStorage.setItem("source", source || "");
    localStorage.setItem("terms_accepted", terms_accepted?.toString());
    localStorage.setItem("multi_role_enabled", multi_role_enabled?.toString());
    localStorage.setItem("multi_role_enabled", multi_role_enabled?.toString());
    localStorage.setItem(
      "permission_ids",
      JSON.stringify(permission_ids || [])
    );
    localStorage.setItem(
      "login_history_id",
      JSON.stringify(login_history_id || "")
    );
    getLabelInfo("", "Bearer " + accessToken);
    await fetchAndStoreLabels("");
    //debugger;
    localStorage.setItem("UserType", encodeBase64(userrole.toString()));
    localStorage.setItem("file_name", file_name || "");

    const fullName = `${firstName} ${lastName}`.trim();
    if (window?.Tawk_API?.setAttributes) {
      window.Tawk_API.setAttributes(
        {
          name: fullName,
          email: email.toLowerCase(),
        },
        (error) => {
          if (error) {
            console.error("Tawk.to setAttributes error:", error);
          } else {
            console.log("Tawk.to user identity set");
          }
        }
      );
    }
  };

  // New function to generate OTP
  const generateOtp = async () => {
    const uri = `${BASE_URL}/auth/otp_generate`;
    const payload = JSON.stringify({ email });

    try {
      const jsonResult = await PostAsync(uri, payload);
      console.log("Send OTP Response:", JSON.stringify(jsonResult, null, 2));
      if (jsonResult.status === "success") {
        setIsOtpSent(true);
        showAlert("OTP sent to your email.");
      } else {
        showAlert(jsonResult.message || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      showAlert("An error occurred while sending OTP.");
    }
  };

  // New function to verify OTP
  const verifyOtp = async () => {
    if (!otp) {
      tempErrors.otp = "OTP is required";
      setErrors(tempErrors);
      return;
    }
    tempErrors.otp = "";
    setErrors(tempErrors);

    const uri = `${BASE_URL}/auth/verify_otp`;
    const payload = JSON.stringify({ email, otp });

    try {
      const jsonResult = await PostAsync(uri, payload);
      console.log("Verify OTP Response:", JSON.stringify(jsonResult, null, 2));
      if (jsonResult.status === "success") {
        const { accessToken, user, refreshToken } = jsonResult.data;
        const {
          userId,
          userrole,
          customer_id,
          company_name,
          firstName,
          lastName,
          source,
          file_name,
          permission_ids,
          login_history_id,
          landing_url,
          terms_accepted,
          multi_role_enabled,
        } = user;

        await storeUserData({
          email,
          userId,
          accessToken,
          refreshToken,
          customer_id,
          company_name,
          firstName,
          lastName,
          source,
          file_name,
          permission_ids,
          login_history_id,
          userrole,
          terms_accepted,
          multi_role_enabled,
        });

        const UserType = decodeBase64(localStorage.getItem("UserType") ?? "");
        navigation(landing_url);
        // if (UserType === '1' || userrole === 1) {
        //   localStorage.setItem('isAdmin', 'yes');
        //   navigate('Main', {screen: 'CustomerList'});
        // } else {
        //   navigate('Main', {screen: 'AdminDboard'});
        // }
      } else {
        showAlert(jsonResult.message || "Invalid OTP.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
    }
  };
  const handleVerifyEmail = async () => {
    if (!email) {
      tempErrors.email = "Email/User name is required";
      setErrors(tempErrors);
      return;
    }
    tempErrors.email = "";
    setErrors(tempErrors);

    if (isEmailEditable) {
      const payload = JSON.stringify({ email });
      const uri = `${BASE_URL}/auth/verify_login`;
      try {
        const jsonResult = await PostAsync(uri, payload);
        console.log(
          "Verify Email Response:",
          JSON.stringify(jsonResult, null, 2)
        );
        if (jsonResult.status === "success") {
          const {
            integration_customer_id,
            integration_name,
            client_id,
            client_secret,
            tenant_id,
            domain_name,
            mfa_enabled, // New field from backend
          } = jsonResult.data.user;
          console.log("Integration Details:", {
            integration_name,
            client_id,
            client_secret,
            tenant_id,
            domain_name,
            mfa_enabled,
          });

          setIsMfaEnabled(mfa_enabled); // Set MFA status

          if (integration_customer_id) {
            if (integration_name === "Microsoft") {
              const updatedConfig = {
                clientId: client_id || "",
                authorizationEndpoint: tenant_id
                  ? `https://login.microsoftonline.com/${tenant_id}/oauth2/v2.0/authorize`
                  : "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
                tokenEndpoint: tenant_id
                  ? `https://login.microsoftonline.com/${tenant_id}/oauth2/v2.0/token`
                  : "https://login.microsoftonline.com/common/oauth2/v2.0/token",
                redirectUri: `${APP_URL}`,
                scopes: ["openid", "profile", "email"],
              };
              console.log("Updated Microsoft Config:", updatedConfig);
              setOAuthConfig(updatedConfig);
              await handleMicrosoftLogin(updatedConfig, email);
            } else if (integration_name === "Okta") {
              const updatedConfig = {
                clientId: client_id || "",
                redirectUri: `${APP_URL}`,
                scopes: ["openid", "profile", "email"],
                authorizationEndpoint: domain_name
                  ? `https://${domain_name}/oauth2/default/v1/authorize`
                  : "https://your-default-okta-domain.okta.com/oauth2/default/v1/authorize",
                tokenEndpoint: domain_name
                  ? `https://${domain_name}/oauth2/default/v1/token`
                  : "https://your-default-okta-domain.okta.com/oauth2/default/v1/token",
              };
              console.log("Updated Okta Config:", updatedConfig);
              setOAuthConfig(updatedConfig);
              await handleOktaLogin(updatedConfig, email);
            }
          } else if (mfa_enabled) {
            setIsOtpVerification(true); // Show OTP input if MFA is enabled
            setIsEmailEditable(false);
          } else {
            setIsEmailEditable(false); // Proceed to password input
          }
        } else {
          showAlert(jsonResult.message);
        }
      } catch (error) {
        console.error("Error verifying email:", error);
        showAlert("An error occurred while verifying email.");
      }
    } else {
      tempErrors.password = "Password is required";
      setErrors(tempErrors);
    }
  };
  const handleMicrosoftLogin = async (
    configuration: any,
    userEmail: string
  ) => {
    try {
      console.log("Microsoft Config:", configuration);
      if (!configuration.clientId) {
        throw new Error("Microsoft Client ID is missing");
      }

      const { codeVerifier, codeChallenge } = generatePKCEChallenge();
      localStorage.setItem("pkce_verifier", codeVerifier);
      const randomState = generateRandomString(32);
      const statePayload = {
        random: randomState,
        config: {
          clientId: configuration.clientId,
          tokenEndpoint: configuration.tokenEndpoint,
          redirectUri: configuration.redirectUri,
        },
        provider: "microsoft",
        email: userEmail,
      };
      const encodedState = encodeURIComponent(
        btoa(JSON.stringify(statePayload))
      );
      localStorage.setItem("microsoft_state", randomState);

      const authUrl = `${configuration.authorizationEndpoint}?client_id=${
        configuration.clientId
      }&redirect_uri=${encodeURIComponent(
        configuration.redirectUri
      )}&response_type=code&scope=${encodeURIComponent(
        configuration.scopes.join(" ")
      )}&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${encodedState}&prompt=select_account&login_hint=${encodeURIComponent(
        userEmail
      )}`;

      console.log("Full Microsoft Auth URL:", authUrl);
      setAuthUrl(authUrl);

      window.location.href = authUrl;
    } catch (error) {
      console.error("Error initiating Microsoft login:", error);
    }
  };

  const handleOktaLogin = async (configuration: any, userEmail: string) => {
    try {
      console.log("Okta Config:", configuration);
      if (!configuration.clientId) {
        throw new Error("Okta Client ID is missing");
      }

      const { codeVerifier, codeChallenge } = generatePKCEChallenge();
      localStorage.setItem("pkce_verifier", codeVerifier);
      const randomState = generateRandomString(32);
      const statePayload = {
        random: randomState,
        config: {
          clientId: configuration.clientId,
          tokenEndpoint: configuration.tokenEndpoint,
          redirectUri: configuration.redirectUri,
        },
        provider: "okta",
        email: userEmail,
      };
      const encodedState = encodeURIComponent(
        btoa(JSON.stringify(statePayload))
      );
      localStorage.setItem("okta_state", randomState);

      const authUrl = `${configuration.authorizationEndpoint}?client_id=${
        configuration.clientId
      }&redirect_uri=${encodeURIComponent(
        configuration.redirectUri
      )}&response_type=code&scope=${encodeURIComponent(
        configuration.scopes.join(" ")
      )}&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${encodedState}&login_hint=${encodeURIComponent(
        userEmail
      )}`;

      console.log("Full Okta Auth URL:", authUrl);
      setAuthUrl(authUrl);

      window.location.href = authUrl;
    } catch (error) {
      console.error("Error initiating Okta login:", error);
    }
  };

  const passwordInputRef = useRef<any>(null);
  const otpInputRef = useRef<any>(null);

  useEffect(() => {
    if (!isEmailEditable && passwordInputRef.current && !isOtpVerification) {
      passwordInputRef.current.focus();
    } else if (isOtpVerification && otpInputRef.current && isOtpSent) {
      otpInputRef.current.focus();
    }
  }, [isEmailEditable, isOtpVerification, isOtpSent]);
  useEffect(() => {
    const handleOAuthRedirect = async () => {
      try {
        const url = window.location.href;

        console.log("Redirect URL:", url);
        if (url) {
          const params = new URL(url).searchParams;
          const authorizationCode = params.get("code");
          const error = params.get("error");
          const returnedState = params.get("state");

          if (error) {
            console.log("Error:", error);
            return;
          }

          if (!returnedState) {
            //Alert.alert("Login Failed", "State parameter missing.");
            return;
          }

          let statePayload;
          try {
            statePayload = JSON.parse(atob(decodeURIComponent(returnedState)));
          } catch (e) {
            //Alert.alert("Login Failed", "Invalid state format.");
            return;
          }

          const {
            random: randomState,
            config,
            provider,
            email: expectedEmail,
          } = statePayload;
          const stateKey =
            provider === "okta" ? "okta_state" : "microsoft_state";
          const storedState = localStorage.getItem(stateKey);
          console.log(
            "Stored State:",
            storedState,
            "Returned Random State:",
            randomState
          );

          if (randomState !== storedState) {
            // Alert.alert(
            //   "Login Failed",
            //   "Invalid state parameter. Possible security issue."
            // );
            return;
          }

          if (authorizationCode) {
            console.log(
              "Authorization Code:",
              authorizationCode,
              "Provider:",
              provider,
              "Expected Email:",
              expectedEmail
            );
            await handleTokenExchange(
              authorizationCode,
              provider,
              config,
              expectedEmail
            );
          }
        }
      } catch (error) {
        console.error("Error handling OAuth redirect:", error);
        // Alert.alert(
        //   "Login Failed",
        //   "An error occurred during redirect handling."
        // );
      }
    };

    handleOAuthRedirect();
  }, []);
  const handleProcessLogin = async (email: string) => {
    const uri = `${BASE_URL}/auth/login_oauth`;
    const payload = JSON.stringify({ email });

    try {
      const jsonResult = await PostAsync(uri, payload);
      console.log("OAuth Login Response:", JSON.stringify(jsonResult, null, 2));
      if (jsonResult.status === "success") {
        const { accessToken, user, refreshToken } = jsonResult.data;
        const {
          userId,
          userrole,
          customer_id,
          company_name,
          firstName,
          lastName,
          source,
          login_history_id,
          landing_url,
          terms_accepted,
          multi_role_enabled,
        } = user;

        await storeUserData({
          email,
          userId,
          accessToken,
          refreshToken,
          customer_id,
          company_name,
          firstName,
          lastName,
          source,
          file_name: user.file_name || "",
          permission_ids: user.permission_ids || [],
          login_history_id,
          userrole,
          terms_accepted,
          multi_role_enabled,
        });

        const UserType = decodeBase64(localStorage.getItem("UserType") ?? "");
        navigation(landing_url);
        // if (UserType === '3' || userrole === 3) {
        //   navigate('Main', {screen: 'Adminpanel'});
        // } else if (UserType === '1' || userrole === 1) {
        //   navigate('Main', {screen: 'SignupScreen'});
        // } else if (UserType === '103' || userrole === 103) {
        //   navigate('Main', {screen: 'IntakeList'});
        // } else {
        //   navigate('Main', {screen: 'AdminDboard'});
        // }
      } else {
        //Alert.alert("Login Failed", "Authentication failed. Please try again.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      //Alert.alert("An error occurred. Please try again later.");
    }
  };

  const handleTokenExchange = async (
    authorizationCode: string,
    provider: string | null = "microsoft",
    config: any,
    expectedEmail: string
  ) => {
    try {
      console.log(
        "Token Exchange Config:",
        config,
        "Expected Email:",
        expectedEmail
      );
      if (!config || !config.clientId || !config.tokenEndpoint) {
        throw new Error("OAuth configuration missing or incomplete.");
      }

      const codeVerifier = localStorage.getItem("pkce_verifier");
      if (!codeVerifier) {
        throw new Error("PKCE code verifier not found.");
      }

      const requestBody = {
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        grant_type: "authorization_code",
        code: authorizationCode,
        code_verifier: codeVerifier,
      };

      const response = await fetch(config.tokenEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(requestBody).toString(),
      });

      const tokenData = await response.json();
      console.log(
        "Token Exchange Response:",
        JSON.stringify(tokenData, null, 2)
      );
      if (response.ok) {
        const { id_token } = tokenData;
        const decodedToken = jwtDecode(id_token);
        const actualEmail =
          decodedToken.email || decodedToken.preferred_username;
        console.log(
          "Actual Email:",
          actualEmail,
          "Expected Email:",
          expectedEmail
        );

        if (actualEmail.toLowerCase() !== expectedEmail.toLowerCase()) {
          throw new Error(
            "Logged-in account does not match the entered email. Please select the correct account."
          );
        }

        await handleProcessLogin(actualEmail);
      } else {
        // Alert.alert(
        //   "Login Failed",
        //   tokenData.error_description ||
        //     "An error occurred during token exchange."
        // );
      }
    } catch (error) {
      console.error("Token Exchange Failed:", error);
      //   Alert.alert(
      //     "Login Failed",
      //     error.message || "Unable to exchange authorization code."
      //   );
    }
  };
  const [secureText, setSecureText] = useState(true);
  const handleTogglePassword = () => {
    setSecureText((prev) => !prev);
  };

  const [errorMessage, setErrorMessage] = useState("");
  const handleResetPassword = async () => {
    try {
      const response = await forgotPassword({ email: forgotScreenEmail });
      const parsedResponse = JSON.parse(response);
      setErrorMessage(
        parsedResponse.status === "success"
          ? parsedResponse.message
          : parsedResponse.message || "Something went wrong."
      );
    } catch (error) {
      console.error("Error resetting password:", error);
      setErrorMessage("Something went wrong. Please try again later.");
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto px-4 py-8 bg-white shadow-xl rounded-xl">
        <img
          src={ForgeLogoVertical}
          alt="Forge Logo"
          className="h-24 mx-auto mb-6 object-contain"
        />
        <h2 className="text-2xl font-semibold text-center mb-4 text-blue-800">
          Portfolio Xpert
        </h2>

        <div className="relative mb-4">
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email Address or Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!isEmailEditable}
            onKeyDown={(e) =>
              e.key === "Enter" && isEmailEditable && handleVerifyEmail()
            }
          />
          {!isEmailEditable && (
            <button
              className="absolute top-2 right-2"
              onClick={() => {
                setIsEmailEditable(true);
                setIsOtpVerification(false);
              }}
            >
              <Pencil_svg height={20} width={20} fill="black" />
            </button>
          )}
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {isOtpVerification && !isEmailEditable ? (
          <>
            <div className="relative mb-4">
              <input
                ref={otpInputRef}
                type="text"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                onKeyDown={(e) => e.key === "Enter" && verifyOtp()}
              />
              <button
                className="absolute top-2 right-2 text-blue-600 underline text-sm"
                onClick={generateOtp}
              >
                {isOtpSent ? "Resend OTP" : "Generate OTP"}
              </button>
              {errors.otp && (
                <p className="text-red-500 text-sm mt-1">{errors.otp}</p>
              )}
            </div>
            <button
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              onClick={verifyOtp}
            >
              Verify OTP
            </button>
          </>
        ) : !isEmailEditable ? (
          <div className="relative mb-4">
            <input
              ref={passwordInputRef}
              type={secureText ? "password" : "text"}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <button
              className="absolute top-2 right-2"
              onClick={handleTogglePassword}
            >
              <Eye_svg height={24} width={24} fill="black" />
            </button>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
        ) : null}

        <div className="text-right mb-4">
          <button
            // onClick={handleForgotPassword}
            onClick={() => navigation("forgot-password")}
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot your password?
          </button>
        </div>

        {!isOtpVerification && (
          <button
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 mb-4"
            onClick={() =>
              isEmailEditable ? handleVerifyEmail() : handleLogin()
            }
          >
            {isEmailEditable ? "Continue" : "Log in"}
          </button>
        )}

        <div className="flex items-center justify-center gap-2">
          <span className="text-sm">Not a Customer?</span>
          <button
            // onClick={() => setIsRegistration(true)}
            onClick={() => navigation("create-account")}
            className="text-sm text-blue-600 underline"
          >
            Register now
          </button>
        </div>
      </div>
      <AlertBox
        visible={alertVisible}
        onCloseAlert={closeAlert}
        message={alertMessage}
      />
    </div>
  );
};

export default LoginScreen;
