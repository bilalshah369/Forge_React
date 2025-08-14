/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  GetAsync_with_token,
  PostAsync,
  PostAsync_with_token,
} from '../services/rest_api_service';
const BASE_URL = import.meta.env.VITE_BASE_URL;
//export const BASE_URL = 'https://underbuiltapi.aadhidigital.com';

export const GetApprovedProjects = async (params: {
  projectId?: any;
  PageNo?: number;
  PageSize?: number;
}): Promise<string> => {
  try {
    // Set default values for PageNo and PageSize if not provided
    const PageNo = params?.PageNo ?? 1; // Default to page 1
    const PageSize = params?.PageSize ?? 10; // Default to 10 records per page
    ////debugger;
    const projectIdT = params?.projectId; // Optional project ID

    // Construct the URL with pagination and optional projectId
    const uri = `${BASE_URL}/projectFlow/get_approved_project?${
      projectIdT ? `project_id=${projectIdT}&` : ''
    }PageNo=${PageNo}&PageSize=${PageSize}`;

    const token = localStorage.getItem('Token'); // Retrieve token from storage
    ////////debugger
    //console.log('Request URL:', uri);

    const jsonResult = await GetAsync_with_token(uri, token); // Fetch data with token
    //console.log('Response JSON:', jsonResult);

    return JSON.stringify(jsonResult ?? ''); // Return the result as a string
  } catch (error) {
    console.error('Error in GetApprovedProjects:', error);
    throw new Error(`Failed to fetch approved projects: ${error}`);
  }
};

// GetSearchedApprovedProjects

export const GetSearchedApprovedProjects = async (
  PageNo: number,
  PageSize: number,
  query: string,
): Promise<string> => {
  try {
    const uri = `${BASE_URL}/projectFlow/get_approved_project?project_name=${encodeURIComponent(
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

export const GetApprovedProjectsWithFilters = async (filters: {
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
    let uri = `${BASE_URL}/projectFlow/get_approved_project`;

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
      queryParams.append('classification', filters.classification_id);
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

export const InsertMember = async (values: object): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/approvedProjects/insert_project_team`;
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

export const GetTeamMembers = async (projectId: any): Promise<string> => {
  try {
    ////////debugger
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/approvedProjects/get_project_team?project_id=${projectId}`;
    //var uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    //console.log(uri);
  
    var jsonResult = await GetAsync_with_token(uri, token);

    //////debugger;
    //console.log(jsonResult);
    ////////debugger
    //  //console.log("jsonResult from API:", jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const InsertMilestone = async (values: object): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/approvedProjects/insert_milestone`;
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

export const GetMilestones = async (projectId: any): Promise<string> => {
  try {
    ////////debugger
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/approvedProjects/get_milestones?project_id=${projectId}`;
    //var uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    //console.log(uri);
 
    var jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    ////////debugger
    //  //console.log("jsonResult from API:", jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const DeleteMilestone = async (values: object): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/approvedProjects/delete_milestone`;
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

export const InsertMilestoneMember = async (
  values: object,
): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/approvedProjects/insert_milestone_resource`;
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

export const InsertMilestoneMemberMultiple = async (
  values: object,
): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/approvedProjects/insert_milestone_resources_multiple`;
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

export const GetMilestonesResource = async (
  milestone_id: any,
): Promise<string> => {
  try {
    /* const { milestone_id, project_id } = payload; */
    ////////debugger
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/approvedProjects/get_milestone_resources?milestone_id=${milestone_id}`;
    //var uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    //console.log(uri);
   
    var jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    ////////debugger
    //  //console.log("jsonResult from API:", jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const DeleteMember = async (values: object): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/approvedProjects/delete_project_team`;
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

export const InsertCustomField = async (values: object): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/approvedProjects/insert_project_custom_field`;
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

export const GetCustomFields = async (projectId: any): Promise<string> => {
  try {
    ////////debugger
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/approvedProjects/get_project_custom_fields?project_id=${projectId}`;
    //var uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    //console.log(uri);
   
    var jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    ////////debugger
    //  //console.log("jsonResult from API:", jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const DeleteCustomField = async (values: object): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/approvedProjects/delete_project_custom_field`;
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

export const StartProject = async (values: object): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/approvedProjects/start_project`;
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

export const MemberChangeRequest = async (values: object): Promise<string> => {
  try {
    var uri = `${BASE_URL}/projectChanges/upsert_team_member_change`;
    const token = localStorage.getItem('Token');
    var payload = JSON.stringify(values);
    var jsonResult = await PostAsync_with_token(uri, payload, token);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const MilestoneChangeRequest = async (
  values: object,
): Promise<string> => {
  try {
    var uri = `${BASE_URL}/projectChanges/upsert_milestone_change`;
    const token = localStorage.getItem('Token');
    var payload = JSON.stringify(values);
    var jsonResult = await PostAsync_with_token(uri, payload, token);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const GetChangeRequest = async (project_id: number) => {
  try {
    //////////debugger;
    var uri = `${BASE_URL}/projectChanges/get_filled_data_for_change_requests?project_id=${project_id}`;
    const token = localStorage.getItem('Token');
    var jsonRes = await GetAsync_with_token(uri, token);
    return JSON.stringify(jsonRes);
  } catch (err) {
    console.error(err);
    throw Error('Failes' + err);
  }
};

export const GetChangeRequestPreview = async (project_id: number) => {
  try {
    var uri = `${BASE_URL}/projectDetails/get_field_change_requests_preview?project_id=${project_id}`;
    const token = localStorage.getItem('Token');
    var jsonRes = await GetAsync_with_token(uri, token);
    return JSON.stringify(jsonRes);
  } catch (err) {
    console.error(err);
    throw Error('Failes' + err);
  }
};

export const UpdateChangeSendTo = async (values: object) => {
  try {
    var uri = `${BASE_URL}/projectChanges/upsert_sent_to_for_approval`;
    const token = localStorage.getItem('Token');
    var payload = JSON.stringify(values);
    var jsonResult = await PostAsync_with_token(uri, payload, token);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const DeleteNewRequest = async (change_id: number) => {
  try {
    var uri = `${BASE_URL}/projectChanges/delete_change_request`;
    const token = localStorage.getItem('Token');
    const payload = JSON.stringify({change_request_id: change_id});
    var jsonRes = await PostAsync_with_token(uri, payload, token);
    return JSON.stringify(jsonRes);
  } catch (err) {
    console.error(err);
    throw Error('Failed' + err);
  }
};

export const HandleChangeRequest = async (values: object) => {
  try {
    var uri = `${BASE_URL}/projectChanges/approve_change_request`;
    const token = localStorage.getItem('Token');
    var payload = JSON.stringify(values);
    var jsonResult = await PostAsync_with_token(uri, payload, token);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
