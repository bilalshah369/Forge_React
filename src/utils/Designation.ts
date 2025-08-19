import {
  GetAsync_with_token,
  PostAsync,
  PostAsync_with_token,
} from "../services/rest_api_service";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const deleteDesignation = async (
  designationId: number
): Promise<any> => {
  try {
    const uri = `${BASE_URL}/customeradmin/delete_designation`;
    const token = await localStorage.getItem("Token");

    if (!token) {
      throw new Error("No authentication token found");
    }

    //console.log('Delete URI:', uri);

    const payload = JSON.stringify({ designation_id: designationId });
    //console.log('Delete Payload:', payload);

    const jsonResult = await PostAsync_with_token(uri, payload, token);
    //console.log('Delete API Response:', jsonResult);

    return jsonResult;
  } catch (error) {
    console.error("Error in deleteDesignation:", error);
    throw error;
  }
};
export const AddAndEditDesignation = async (values: {
  designation_id: number;
  designation_name: string;
  is_active: boolean;
}): Promise<string> => {
  //console.log(values, "Adding/Editing designation")

  try {
    var uri = `${BASE_URL}/customeradmin/insert_designation`;
    const token = await localStorage.getItem("Token");
    //console.log(uri);

    var payload = JSON.stringify(values);
    //console.log(payload);

    var jsonResult = await PostAsync_with_token(uri, payload, token);
    //console.log(jsonResult, "API response");

    return JSON.stringify(jsonResult ?? "");
  } catch (error) {
    console.error(error);
    throw Error("Failed to add/edit designation: " + error);
  }
};
export const GetDesignation = async (query: string): Promise<string> => {
  try {
    var uri = `${BASE_URL}/customeradmin/get_designations`;
    const token = await localStorage.getItem("Token");
    //console.log(uri);
    var jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    return JSON.stringify(jsonResult ?? "");
  } catch (error) {
    console.error(error);
    throw Error("Failed" + error);
  }
};

export const GetDesignationByPage = async (query: {
  pageNo: number;
  pageSize: number;
}): Promise<string> => {
  try {
    const uri = `${BASE_URL}/customeradmin/get_designations?PageNo=${query.pageNo}&PageSize=${query.pageSize}`;
    const token = await localStorage.getItem("Token");

    const jsonResult = await GetAsync_with_token(uri, token);

    return JSON.stringify(jsonResult ?? "");
  } catch (err) {
    console.error(err);
    throw Error("Failed" + err);
  }
};
