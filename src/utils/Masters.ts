/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */

import {
  GetAsync_with_token,
  PostAsync,
  PostAsync_with_token,
} from '../services/rest_api_service';
//export const BASE_URL = 'https://underbuiltapi.aadhidigital.com';
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const deleteClassification = async (
  classificationId: number,
): Promise<any> => {
  try {
    const uri = `${BASE_URL}/utils/delete_classification`;
    const token = localStorage.getItem('Token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    //console.log('Delete URI:', uri);

    const payload = JSON.stringify({classification_id: classificationId});
    //console.log('Delete Payload:', payload);

    const jsonResult = await PostAsync_with_token(uri, payload, token);
    //console.log('Delete API Response:', jsonResult); // Fixed typo here

    return jsonResult; // Return the raw result, let the caller stringify if needed
  } catch (error) {
    console.error('Error in deleteClassification:', error);
    throw error; // Rethrow the original error
  }
};
export const deleteBudgetDetails = async (
  budgetId: number,
): Promise<any> => {
  try {
    const uri = `${BASE_URL}/utils/delete_budget_details_project_plan`;
    const token = localStorage.getItem('Token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    //console.log('Delete URI:', uri);

    const payload = JSON.stringify({budget_detail_id: budgetId});
    //console.log('Delete Payload:', payload);

    const jsonResult = await PostAsync_with_token(uri, payload, token);
    //console.log('Delete API Response:', jsonResult); // Fixed typo here

    return jsonResult; // Return the raw result, let the caller stringify if needed
  } catch (error) {
    console.error('Error in deleteClassification:', error);
    throw error; // Rethrow the original error
  }
};
export const AddAndEditClassification = async (values: {
  classification_id?: number;
  classification_name?: string;
  is_active?: boolean;
}): Promise<string> => {
  //console.log(values, "Adding/Editing classification")

  try {
    var uri = `${BASE_URL}/utils/insert_classification`;
    const token = localStorage.getItem('Token');
    //console.log(uri);
    var payload = JSON.stringify(values);
    //console.log(payload);
    var jsonResult = await PostAsync_with_token(uri, payload, token);
    //console.log(jsonResult, "API response");
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed to add/edit classification: ' + error);
  }
};
export const GetClasssifcation = async (query: string): Promise<string> => {
  try {
    //////////debugger
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/utils/get_classifications?is_active=${query}`;
    //var uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    //console.log(uri);
    var jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    //////////debugger
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const GetClasssifcationByPage = async (queryParams: {
  PageNo: number;
  PageSize?: string | number; 
}): Promise<string> => {
 
    try {
      let uri = `${BASE_URL}/utils/get_classifications?isactive=`;
  
      uri += `&PageNo=${queryParams.PageNo}`;
  
      if (queryParams.PageSize !== '') {
        uri += `&PageSize=${queryParams.PageSize}`;
      }
    const token = localStorage.getItem('Token');

    const jsonResult = await GetAsync_with_token(uri, token);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed to get classifications: ' + error);
  }
};

export const deleteDesignation = async (
  designationId: number,
): Promise<any> => {
  try {
    const uri = `${BASE_URL}/customeradmin/delete_designation`;
    const token = localStorage.getItem('Token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    //console.log('Delete URI:', uri);

    const payload = JSON.stringify({designation_id: designationId});
    //console.log('Delete Payload:', payload);

    const jsonResult = await PostAsync_with_token(uri, payload, token);
    //console.log('Delete API Response:', jsonResult);

    return jsonResult;
  } catch (error) {
    console.error('Error in deleteDesignation:', error);
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
    const token = localStorage.getItem('Token');
    //console.log(uri);

    var payload = JSON.stringify(values);
    //console.log(payload);

    var jsonResult = await PostAsync_with_token(uri, payload, token);
    //console.log(jsonResult, "API response");

    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed to add/edit designation: ' + error);
  }
};
export const GetDesignation = async (query: string): Promise<string> => {
  try {
    var uri = `${BASE_URL}/customeradmin/get_designations`;
    const token = localStorage.getItem('Token');
    //console.log(uri);
    var jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
