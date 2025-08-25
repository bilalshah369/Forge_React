/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */
import {
  GetAsync_with_token,
  PostAsync,
  PostAsync_with_token,
} from '../services/rest_api_service';
import { getCustomerId } from './RoleMaster';
import { decodeBase64 } from './securedata';
//export const BASE_URL = 'https://underbuiltapi.aadhidigital.com';
const BASE_URL = import.meta.env.VITE_BASE_URL;
export const GetAllResources = async (): Promise<string> => {
  try {
    const customerId = await getCustomerId();
    const token = localStorage.getItem('Token');

    // Base URL with customer ID
    let uri = `${BASE_URL}/customeradmin/get_resources?customer_id=${customerId}`;

  
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log('API Response:', jsonResult);

    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error('Error in GetResources:', error);
    throw new Error('Failed: ' + error);
  }
};
export const GetAllResourcesALL = async (): Promise<string> => {
  try {
    const customerId = await getCustomerId();
    const token = localStorage.getItem('Token');

    // Base URL with customer ID
    let uri = `${BASE_URL}/master/get_users?is_active=true`;

  
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log('API Response:', jsonResult);

    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error('Error in GetResources:', error);
    throw new Error('Failed: ' + error);
  }
};
export const GetResources = async (queryParams: {
  PageNo: number;
  PageSize: number;
  [key: string]: any; // Allows additional filters like country_id, state_id, etc.
}): Promise<string> => {
  try {
    const customerId = await getCustomerId();
    const token = localStorage.getItem('Token');

    // Base URL with customer ID
    let uri = `${BASE_URL}/customeradmin/get_resources?customer_id=${customerId}`;

    // Append additional query parameters for pagination and filters
    const queryString = Object.keys(queryParams)
      .map(
        key =>
          `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`,
      )
      .join('&');

    uri = `${uri}&${queryString}`;
    //console.log('Constructed URI:', uri);

    // Make the API call
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log('API Response:', jsonResult);

    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error('Error in GetResources:', error);
    throw new Error('Failed: ' + error);
  }
};

export const GetSearchedResources = async (
  PageNo: number,
  PageSize: number,
  query: string,
): Promise<string> => {
  try {
    const uri = `${BASE_URL}/customeradmin/get_resources?first_name=${encodeURIComponent(
      query,
    )}&PageNo=${PageNo}&PageSize=${PageSize}`;

    const token = localStorage.getItem('Token'); // Retrieve the token from storage
    //console.log('API Request URI:', uri);

    const jsonResult = await GetAsync_with_token(uri, token); // Make the request with the token
    //console.log('API Response:', jsonResult);

    return JSON.stringify(jsonResult ?? ''); // Return the response as a string
  } catch (error) {
    console.error('Error in GetSearchedProjects:', error);
    throw new Error('Failed to fetch searched projects: ' + error);
  }
};

export const GetResourcesWithFilters = async (filters: {
  PageNo?: number,
  PageSize?: number,
  status?: string;
  budget?: string;
  first_name?: string;
  email?: string;
  reporting_to?: number;
  role_id?: number;
  department_id?: number;
  project_manager?: string;
  project_owner_user?: string;
  project_owner_dept?: string;
  goal_id?: number;
  golive_date?: string;
  is_a_user?:boolean;
}): Promise<string> => {
  try {
    ////////////debugger;
    let uri = `${BASE_URL}/customeradmin/get_resources`;

    // Build the query string dynamically from the filters object
    const queryParams = new URLSearchParams();

    if (filters.status) queryParams.append('status', filters.status);
    if (filters.budget) queryParams.append('budget', filters.budget);
    if (filters.first_name) queryParams.append('first_name', filters.first_name);
    if (filters.email) queryParams.append('email', filters.email);
    if ((filters.is_a_user ?? true)) queryParams.append('is_user', filters.is_a_user?.toString());

    // Only add reporting_to, role_id, and department_id if they are not -1
    if (filters.reporting_to !== -1 && filters.reporting_to != null)
      queryParams.append('reporting_to', filters.reporting_to.toString());
    if (filters.role_id !== -1 && filters.role_id != null)
      queryParams.append('role_id', filters.role_id.toString());
    if (filters.department_id !== -1 && filters.department_id != null)
      queryParams.append('department_id', filters.department_id.toString());

    if (filters.project_manager) queryParams.append('project_manager', filters.project_manager);
    if (filters.project_owner_user) queryParams.append('project_owner_user', filters.project_owner_user);
    if (filters.project_owner_dept) queryParams.append('project_owner_dept', filters.project_owner_dept);
    if (filters.goal_id) queryParams.append('goal_id', filters.goal_id.toString());
    if (filters.golive_date) queryParams.append('golive_date', filters.golive_date);

    // Append the query string to the base URL
    if (queryParams.toString()) {
      uri += `?${queryParams.toString()}`;
    }

    const token = localStorage.getItem('Token');
    //console.log('Making API call to:', uri);

    // Make the API request with the token
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log('jsonResult:', jsonResult);

    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error('Error in GetResourcesWithFilters API call:', error);
    throw Error('Failed to fetch resources: ' + error);
  }
};

export const GetResourceType = async (query: string): Promise<string> => {
  try {
    //////////debugger
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/customeradmin/get_resource_types`;
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

export const AddResource = async (values: object): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/customeradmin/insert_update_resource_user`;
    //var uri = 'https://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    //console.log(uri);
    var payload = JSON.stringify(values);
    //console.log(payload);
    var jsonResult = await PostAsync_with_token(uri, payload, token);
    //
    //
    //console.log(jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const DeleteResource = async (values: object): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/customeradmin/delete_resource`;
    //var uri = 'https://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    //console.log(uri);
    var payload = JSON.stringify(values);
    //console.log(payload);
    var jsonResult = await PostAsync_with_token(uri, payload, token);
    //
    //
    //console.log(jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

// export const GetUsers = async (query:string): Promise<string> => {
//   try {
//     //////////debugger
//     //const UserID = localStorage.getItem('UserID');
//     var uri = 'https://underbuiltapi.aadhidigital.com/master/get_users';
//     //var uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
//     const token = localStorage.getItem('Token');
//     //console.log(uri);
//     var jsonResult = await GetAsync_with_token(uri, token);
//     //console.log(jsonResult);
//     //////////debugger
//     return JSON.stringify(jsonResult ?? '');
//   } catch (error) {
//     console.error(error);
//     throw Error('Failed' + error);
//   }
// };

export const GetAdIntegration = async (query: string): Promise<string> => {
  try {
    //////////debugger
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/integration/get_users`;
    //var uri = 'https://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
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
export const GetUserDept = async (query: string): Promise<string> => {
  try {
    //////////debugger
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/master/get_department`;
    //var uri = 'https://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
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

export const updateMultipleUsersDepartment = async (
  values: object,
): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/customeradmin/update_resource_department`;
    //var uri = 'https://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    //console.log(uri);
    var payload = JSON.stringify(values);
    //console.log(payload);
    var jsonResult = await PostAsync_with_token(uri, payload, token);
    //
    //
    //console.log(jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
export const updateMultipleUsersRole = async (
  values: object,
): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/customeradmin/update_resource_role`;
    //var uri = 'https://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    //console.log(uri);
    var payload = JSON.stringify(values);
    //console.log(payload);
    var jsonResult = await PostAsync_with_token(uri, payload, token);
    //
    //
    //console.log(jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
export const DeleteMultipleUsers = async (values: object): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/customeradmin/delete_resource`;
    //var uri = 'https://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    //console.log(uri);
    var payload = JSON.stringify(values);
    //console.log(payload);
    var jsonResult = await PostAsync_with_token(uri, payload, token);
    //
    //
    //console.log(jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
export const ConfirmMultipleUsers = async (values: object): Promise<string> => {
  try {
    ////////debugger
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/customeradmin/insert_resource_to_user`;
    //var uri = 'https://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    //console.log(uri);
    var payload = JSON.stringify(values);
    //console.log(payload);
    var jsonResult = await PostAsync_with_token(uri, payload, token);
    //
    //
    //console.log(jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
