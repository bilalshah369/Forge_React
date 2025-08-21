/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */

import {
  GetAsync_with_token,
  PostAsync,
  PostAsync_with_token,
} from '../services/rest_api_service';
//export const BASE_URL = 'https://underbuiltapi.aadhidigital.com';
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const InsertDraft = async (values: object): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/projectFlow/new_project_intake`;
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

export const GetSequence = async (query: string): Promise<string> => {
  try {
    ////////debugger
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/utils/get_sequence`;
    //var uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    //console.log(uri);
   
    var jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    ////////debugger
    //console.log('jsonResult from API:', jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const InsertReview = async (values: object): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/projectFlow/insert_review_process`;
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
export const InsertApproval = async (values: object): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/projectFlow/insert_approval_process`;
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

export const InsertSequence = async (values: object): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/utils/insert_sequence`;
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

export const GetHistory = async (query: object): Promise<string> => {
  try {
    // const uri = `${BASE_URL}/projectflow/get_review_approval_process_history`;
    const uri = `${BASE_URL}/projectFlow/get_project_history`;

    const projectId = query?.project_id;
    const statusType = query?.status_type;
    const PageNo = query?.PageNo ?? 1; // Default to page 1
    const PageSize = query?.PageSize ?? 10; // Default to 10 records per page
    // Construct the full URL with query parameter
    const urlWithParams = `${uri}?project_id=${projectId}&status_type=${statusType}&PageNo=${PageNo}&PageSize=${PageSize}`;

    const token = localStorage.getItem('Token');
    //console.log(urlWithParams); // To verify the complete URL

    // Fetch data with token authorization
    const jsonResult = await GetAsync_with_token(urlWithParams, token);

    //console.log('jsonResult from API:', jsonResult);

    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed to fetch history: ' + error);
  }
};

export const GetProjects = async (params?: {
  PageNo?: number;
  PageSize?: number;
  ProjectId?: string;
}): Promise<string> => {
  try {
    // Extract PageNo and PageSize from params, defaulting to undefined if not provided
    const PageNo = params?.PageNo;
    const PageSize = params?.PageSize;
    const ProjectId = params?.ProjectId;

    // Base URL for the API
    const baseUri = `${BASE_URL}/projectFlow/get_project_intake?is_active=true`;

    // Append pagination parameters only if they are provided
    const uri = `${baseUri}${ProjectId ? `&project_id=${ProjectId}` : ''}${
      PageNo ? `&PageNo=${PageNo}` : ''
    }${PageSize ? `&PageSize=${PageSize}` : ''}`;

    // Retrieve token from storage
    const token = localStorage.getItem('Token');
    //console.log('Request URL:', uri);

    // Fetch data with token
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log('Response JSON:', jsonResult);

    // Return the result as a string
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error('Error in GetProjects:', error);
    throw new Error(`Failed to fetch projects: ${error}`);
  }
};

export const GetSearchedProjects = async (
  PageNo: number,
  PageSize: number,
  query: string,
): Promise<string> => {
  try {
    const uri = `${BASE_URL}/projectFlow/get_project_intake?project_name=${encodeURIComponent(
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
export const GetDecisionProjects = async (
  PageNo: number,
  PageSize: number,
  query: number,
): Promise<string> => {
  try {
    const uri = `${BASE_URL}/projectFlow/get_project_intake?project_name=${encodeURIComponent(
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

export const GetProjectApproval = async (params: {
  projectId?: any;
  PageNo?: number;
  PageSize?: number;
}): Promise<string> => {
  try {
    ////////debugger
    //const UserID = localStorage.getItem('UserID');
    const PageNo = params?.PageNo ?? 1; // Default to page 1
    const PageSize = params?.PageSize ?? 10; // Default to 10 records per page
    const ProjectId = params?.projectId;

    var uri = `${BASE_URL}/projectFlow/get_review_approval_to_user_for_action?project_id=${ProjectId}&is_active=true&PageNo=${PageNo}&PageSize=${PageSize}`;
    //var uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    //console.log(uri) ;
    var jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    ////////debugger
    ////console.log("jsonResult from API:", jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const GetSearchedApprovalProjects = async (
  PageNo: number,
  PageSize: number,
  query: string,
): Promise<string> => {
  try {
    const uri = `${BASE_URL}/projectFlow/get_review_approval_to_user_for_action?project_name=${encodeURIComponent(
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

export const UpdateProjectApproval = async (
  values: object,
): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/projectFlow/update_review_approval_process_status`;
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
export const GetBudgetCategories = async (query: string): Promise<string> => {
  try {
    ////////debugger
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/utils/get_budget_categories`;
    //var uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    // //console.log(uri);``
    var jsonResult = await GetAsync_with_token(uri, token);
    // //console.log(jsonResult);
    ////////debugger
    ////console.log("jsonResult from API:", jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const GetBudgetSubCategories = async (
  query: string,
): Promise<string> => {
  try {
    ////////debugger
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/utils/get_budget_subcategories?category_id=${query}`;
    //var uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    ////console.log(uri);``
    var jsonResult = await GetAsync_with_token(uri, token);
    ////console.log(jsonResult);
    ////////debugger
    // //console.log("jsonResult from API:", jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
export const GetBudgetDetails = async (query: string): Promise<string> => {
  try {
    ////////debugger
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/utils/get_budget_details?project_id=${query}`;
    //var uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    ////console.log(uri);``
    var jsonResult = await GetAsync_with_token(uri, token);
    ////console.log(jsonResult);
    ////////debugger
    // //console.log("jsonResult from API:", jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const InsertBudgetDetails = async (
  values: object[],
): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    //////debugger;
    var uri = `${BASE_URL}/utils/insert_budget_details`;
    //var uri = 'https://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    var payload = JSON.stringify(values);
    var jsonResult = await PostAsync_with_token(uri, payload, token);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const InsertBudgetDetailsSingle = async (
  values: object,
): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    //////debugger;
    var uri = `${BASE_URL}/utils/insert_budget_details_project_plan`;
    //var uri = 'https://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    var payload = JSON.stringify(values);
    var jsonResult = await PostAsync_with_token(uri, payload, token);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const DeleteBudgetDetail = async (values: object): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/utils/delete_budget_detail`;
    //var uri = 'https://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    ////console.log(uri);
    var payload = JSON.stringify(values);
    // //console.log(payload);
    var jsonResult = await PostAsync_with_token(uri, payload, token);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

// const filters = {
//   status: "1,2",           // multiple statuses
//   budget: "123",
//   project_manager: "1,2,3" // multiple project managers
// };  // Example filters object
export const GetProjectsWithFilters = async (filters: {
  PageNo?: number;
  PageSize?: number;
  project_name?: string;
  program_id?: string;
  status?: string;
  project_id?: string;
  budget?: string;
  project_manager?: string;
  project_owner_user?: string;
  project_owner_dept?: string;
  goal_id?: string;
  golive_date?: string;
  phase_status?: string;
  classification_id?: string;
  budget_min?: string;
  budget_max?: string;
  project_start_date?: string;
  project_end_date?: string;
  priority?: string;
}): Promise<string> => {
  try {
    let uri = `${BASE_URL}/projectFlow/get_project_intake`;

    // Build the query string dynamically from the filters object
    const queryParams = new URLSearchParams();

    if (filters.project_name) {
      queryParams.append('project_name', filters.project_name);
    }
    if (filters.program_id) {
      queryParams.append('program_id', filters.program_id);
    }
    if (filters.status) {
      queryParams.append('status', filters.status);
    }
    if (filters.PageNo) {
      queryParams.append('PageNo', filters.PageNo.toString());
    }
    if (filters.PageSize) {
      queryParams.append('PageSize', filters.PageSize.toString());
    }
    if (filters.project_id) {
      queryParams.append('project_id', filters.project_id);
    }
    if (filters.budget) {
      queryParams.append('budget', filters.budget);
    }
    if (filters.project_manager) {
      queryParams.append('project_manager', filters.project_manager);
    }
    if (filters.project_owner_user) {
      queryParams.append('project_owner_user', filters.project_owner_user);
    }
    if (filters.project_owner_dept) {
      queryParams.append('project_owner_dept', filters.project_owner_dept);
    }
    if (filters.goal_id) {
      queryParams.append('goal_id', filters.goal_id);
    }
    if (filters.golive_date) {
      queryParams.append('golive_date', filters.golive_date);
    }
    if (filters.phase_status) {
      queryParams.append('phase_status', filters.phase_status);
    }
    if (filters.classification_id) {
      queryParams.append('classification_id', filters.classification_id);
    }
    if (filters.budget_min?.toString() !== '3000') {
      queryParams.append('budget_min', filters.budget_min ?? '');
    }
    if (filters.budget_max?.toString() !== '9000') {
      queryParams.append('budget_max', filters.budget_max ?? '');
    }
    if (filters.project_start_date) {
      queryParams.append('project_start_date', filters.project_start_date);
    }
    if (filters.project_end_date) {
      queryParams.append('project_end_date', filters.project_end_date);
    }
    if (filters.priority) {
      queryParams.append('priority', filters.priority);
    }

    // Append the query string to the base URL
    uri += `?${queryParams.toString()}`;

    const token = localStorage.getItem('Token');
    //console.log('Making API call to:', uri);

    // Make the API request with the token
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log('jsonResult:', jsonResult);

    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error('Error in GetProjects API call:', error);
    throw Error('Failed to fetch projects: ' + error);
  }
};

export const GetImpactedApplication = async (
  query: string,
): Promise<string> => {
  try {
    var uri = `${BASE_URL}/utils/get_impacted_applications?is_active=${query}`;

    const token = localStorage.getItem('Token');

    var jsonResult = await GetAsync_with_token(uri, token);

    ////////debugger
    // //console.log("jsonResult from API:", jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const DeleteIntake = async (values: object): Promise<string> => {
  try {
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/projectFlow/delete_project`;
    //var uri = 'https://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    ////console.log(uri);
    var payload = JSON.stringify(values);
    //console.log(payload);
    var jsonResult = await PostAsync_with_token(uri, payload, token);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const InsertROIDetails = async (values: object): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/customeradmin/insert_project_roi`;
    //var uri = 'https://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    var payload = JSON.stringify(values);
    var jsonResult = await PostAsync_with_token(uri, payload, token);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
export const GetROIDetails = async (query: string): Promise<string> => {
  try {
    ////////debugger
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/customeradmin/get_project_roi?project_id=${query}`;
    //var uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    ////console.log(uri);``
    var jsonResult = await GetAsync_with_token(uri, token);
    ////console.log(jsonResult);
    ////////debugger
    // //console.log("jsonResult from API:", jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const InsertBulkIntake = async (values: object[]): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/projectFlow/intake`;
    //var uri = 'https://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    var payload = JSON.stringify(values);
    var jsonResult = await PostAsync_with_token(uri, payload, token);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const InsertBulkResources = async (
  values: object[],
): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/master/bulk_insert_resources`;
    //var uri = 'https://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    var payload = JSON.stringify(values);
    var jsonResult = await PostAsync_with_token(uri, payload, token);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
export const GetDependentProjects = async (): Promise<string> => {
  try {
    ////////debugger
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/projectDetails/get_project_names_for_dependency`;
    //var uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    ////console.log(uri);``
    var jsonResult = await GetAsync_with_token(uri, token);
    ////console.log(jsonResult);
    ////////debugger
    // //console.log("jsonResult from API:", jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
