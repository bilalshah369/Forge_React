/* eslint-disable @typescript-eslint/no-explicit-any */
const BASE_URL = import.meta.env.VITE_BASE_URL;
const APP_URL = import.meta.env.VITE_BASE_APP_URL;
//import { navigationRef } from "../navigations/RootNavigation";

import { navigationRef } from "../utils/navigationService";
// 👇️ named export
export function sum(a, b) {
  return a + b;
}
//import localStorage from '@react-native-async-storage/async-storage';
// 👇️ named export
export function multiply(a, b) {
  return a * b;
}
export const GetAsync_with_token = async (uri, Token) => {
  try {

    console.log(BASE_URL);
    const response = await fetch(uri, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: Token,
      },
    });
    // Check if response is not OK (e.g., 403, 401)
    // if (!response.ok) {
    //////debugger;
    if (response.status === 403) {
      // Handle expired token
      const refreshToken = await localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token");
      }

      try {
        const refreshUri = `${BASE_URL}/auth/refresh-token`;
        const payload = JSON.stringify({ refreshToken });
        const jsonResult = await PostAsync(refreshUri, payload);

        if (jsonResult.status === "success") {
          const accessToken = "Bearer " + jsonResult.accessToken;
          await localStorage.setItem("Token", accessToken);
          // Retry the original request with new token
          return GetAsync_with_token(uri, accessToken);
        } else {
          throw new Error("Refresh token failed");
        }
      } catch (refreshErr) {
        // Clear tokens and redirect to LoginScreen
        await localStorage.removeItem("Token");
        await localStorage.removeItem("refreshToken");
        await localStorage.removeItem("lastInteraction");
        
        navigationRef("/");
      
        throw new Error("Session expired");
      }
    }

    // If response is OK, parse and return JSON
    const json = await response.json();
    // console.log('json'+json);
    return json;
  } catch (error) {
    console.error("Error in GetAsync_with_token:", error);
    throw error;
  }
};

export const GetAsync_with_token_X_UserID = async (uri, Token) => {
  try {
    //
    //console.log(Token);
    //const x_auth_user_id = await localStorage.getItem('x_auth_user_id');
    const response = await fetch(uri, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: Token,
        //'X-Auth-User-Id': x_auth_user_id,
      },
    });
    //console.log(uri);
    //console.log(response.status);
    const json = await response.json();
    //console.log(json);
    return json;
  } catch (error) {
    console.error(error);
  }
};
export const PostAsync = async (uri, payload) => {
  try {
    ////////debugger
    const response = await fetch(uri, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: payload,
    });
    ////////debugger
    //console.log('Login respo' + response);
    const json = await response.json();
    ////console.log(json);
    return json;
  } catch (error) {
    ////////debugger
    console.error(error);
  }
};
export const PostAsyncFile = async (uri, payload) => {
  try {
    const response = await fetch(uri, {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
      body: payload,
    });

    // Check if the response is a file (based on content type)
    const contentType = response.headers.get("Content-Type");
    //console.log('Content-Type:', contentType);
    if (contentType && contentType.includes("application/json")) {
      const json = await response.json();
      return json; // Return JSON data
    } else if (
      contentType &&
      contentType.includes(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      )
    ) {
      const blob = await response.blob();

      // Create a link element, use it to download the file
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      // Extract filename from Content-Disposition header, if available
      const contentDisposition = response.headers.get("Content-Disposition");
      let fileName = "downloaded_file.xlsx";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (filenameMatch != null && filenameMatch[1]) {
          fileName = filenameMatch[1].replace(/['"]/g, "");
        }
      }
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Clean up and revoke the object URL
      link.remove();
      URL.revokeObjectURL(downloadUrl);

      return { success: true, message: "File downloaded successfully" };
    } else {
      throw new Error("Unsupported content type");
    }
  } catch (error) {
    console.error("Error:", error);
    return { success: false, error: error.message };
  }
};
export const PostAsync_with_token = async (uri, payload, Token) => {
  try {
    //console.log(Token);
    //const x_auth_user_id = await localStorage.getItem('x_auth_user_id');
    const response = await fetch(uri, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: Token,
        //'X-Auth-User-Id': x_auth_user_id,
      },
      body: payload,
    });
    //get new token if token is expired
    if (response.status === 403) {
      // Handle expired token
      const refreshToken = await localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token");
      }

      try {
        const refreshUri = `${BASE_URL}/auth/refresh-token`;
        const payload1 = JSON.stringify({ refreshToken });
        const jsonResult = await PostAsync(refreshUri, payload1);
        if (jsonResult.status === "success") {
          const accessToken = "Bearer " + jsonResult.accessToken;
          await localStorage.setItem("Token", accessToken);
          // Retry the original request with new token
          return PostAsync_with_token(uri, payload, accessToken);
        } else {
          throw new Error("Refresh token failed");
        }
      } catch (refreshErr) {
        // Clear tokens and redirect to LoginScreen
        await localStorage.removeItem("Token");
        await localStorage.removeItem("refreshToken");
        await localStorage.removeItem("lastInteraction");
         navigationRef("/");
        throw new Error("Session expired");
      }
    }

    ////console.log(response);
    const json = await response.json();
    ////console.log(json);
    return json;
  } catch (error) {
    console.error(error);
  }
};
export const PutAsync_with_token = async (uri, payload, Token) => {
  try {
    //const x_auth_user_id = await localStorage.getItem('x_auth_user_id');

    //console.log(Token);
    const response = await fetch(uri, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: Token,
        //'X-Auth-User-Id': x_auth_user_id,
      },
      body: payload,
    });
    ////console.log(response);
    const json = await response.json();
    ////console.log(json);
    return json;
  } catch (error) {
    console.error(error);
  }
};
// 👇️ (arrow function)
// export const sum = (a, b) => {
//   return a + b;
// };

export const SubmitDetails1 = async (uri, payload) => {
  try {
    //////debugger
    const response = await fetch(uri, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: await localStorage.getItem("Token"),
      },
      body: payload,
    }).then((response) => {
      //////debugger
      //console.log(response);
      //console.log(response.message);
      if (response.status >= 200 && response.status <= 299) {
        const json = response.json();

        return json;
      } else {
        //console.log('fsfsfs' + response.statusText);
      }
    });
  } catch (error) {
    console.error(error);
  }
};
export const SubmitDetails = async (uri, payload) => {
  return fetch(uri, {
    method: "POST",
    headers: {
      Accept: "application/json",
      // 'Content-Type': 'multipart/form-data',
      Authorization: await localStorage.getItem("Token"),
    },
    body: payload,
  })
    .then(async function (response) {
      //////debugger
      //console.log(response);
      //get new token if token is expired
      if (response.status === 403) {
        // Handle expired token
        const refreshToken = await localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        try {
          const refreshUri = `${BASE_URL}/auth/refresh-token`;
          const payload1 = JSON.stringify({ refreshToken });
          const jsonResult = await PostAsync(refreshUri, payload1);
          if (jsonResult.status === "success") {
            const accessToken = "Bearer " + jsonResult.accessToken;
            await localStorage.setItem("Token", accessToken);
            // Retry the original request with new token
            return SubmitDetails(uri, payload);
          } else {
            throw new Error("Refresh token failed");
          }
        } catch (refreshErr) {
          // Clear tokens and redirect to LoginScreen
          await localStorage.removeItem("Token");
          await localStorage.removeItem("refreshToken");
          await localStorage.removeItem("lastInteraction");
          navigationRef("/");
          throw new Error("Session expired");
        }
      }

      return response.json();
    })
    .catch(function (error) {
      //console.log(
      // 'There has been a problem with your fetch operation: ' + error.message,
      //  );
      // ADD THIS THROW error
      throw error;
    });
};
export const Post_Upload_with_token = async (uri, payload, Token) => {
  try {
    //
    //console.log(Token);
    //const x_auth_user_id = await localStorage.getItem('x_auth_user_id');
    const response = await fetch(uri, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
        Authorization: Token,
        //'X-Auth-User-Id': x_auth_user_id,
      },
      body: payload,
    });
    ////console.log(response);
    const json = await response.json();
    ////console.log(json);
    return json;
  } catch (error) {
    console.error(error);
  }
};
export const fetchImageWithAuth = async (url) => {
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: await localStorage.getItem("Token"),
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching image: ${response.status}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob); // Converts blob to a local URL
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const fetchFileWithAuth = async (url) => {
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: await localStorage.getItem("Token"),
      },
    });
    if (!response.ok) {
      throw new Error(`Error fetching file: ${response.status}`);
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob); // Converts blob to a local URL
  } catch (error) {
    console.error(error);
    return null;
  }
};

// const uploadImage = async (imageData: any): Promise<string> => {
//   try {
//     //////debugger
//     // Step 1: Get the Bearer token
//     //setLoading(true);
//     const bearerToken = await localStorage.getItem("Token");
//     if (!bearerToken) {
//       console.log("Authorization token is missing.", bearerToken);
//     }
//     console.log("out of !bearerToken.", bearerToken);

//     const formData = new FormData();
//     const blob = base64ToBlob(imageData.fileuri);
//     //blob.name = imageData.fileName || 'uploaded_image.jpg';
//     formData.append(
//       "image",
//       base64ToBlob(imageData.fileuri ?? ""),
//       imageData.fileName
//     );
//     formData.append("field1", "value1");
//     //formData.append('image', blob);
//     const url = `${BASE_URL}/common/upload_image`;
//     var jsonResult = await SubmitDetails(url, formData);
//     setImage(jsonResult.data.file_name);
//     console.log("SET IMAGE", jsonResult.data.file_name);
//     setLoading(false);

//     return "Uploaded";
//   } catch (error) {
//     setLoading(false);
//     console.error("Error during upload:", error);
//     setImageUri(imageUri);
//     showAlert(
//       "Unsupported file type. Allowed types: jpeg, jpg, png, gif, ttf.\nImage size should be less than 1 MB"
//     );

//     throw new Error(`Failed to upload image: ${error}`);
//   }
// };

// Helper function to convert base64 to Blob (for web)
function base64ToBlob(base64: string): Blob {
  // Check if the base64 string includes a Data URI prefix
  const hasDataUriPrefix = base64.startsWith("data:");
  let byteString, mimeString;

  if (hasDataUriPrefix) {
    const splitDataURI = base64.split(",");
    byteString =
      splitDataURI[0].indexOf("base64") >= 0
        ? atob(splitDataURI[1])
        : decodeURI(splitDataURI[1]);
    mimeString = splitDataURI[0].split(":")[1].split(";")[0];
  } else {
    // Fallback for missing prefix
    byteString = atob(base64);
    mimeString = "image/jpeg"; // Default MIME type (adjust as needed)
  }

  // Create a Uint8Array from the byte string
  const ia = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], { type: mimeString });
}
