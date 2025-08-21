/* eslint-disable @typescript-eslint/no-explicit-any */
//import AsyncStorage from '@react-native-async-storage/async-storage';
// import {
//   GetAsync_with_token,
//   PostAsync,
//   PostAsync_with_token,
// } from '../utils/';
const BASE_URL = import.meta.env.VITE_BASE_URL;
import {GetAsync_with_token,PostAsync,
   PostAsync_with_token} from '../services/rest_api_service'
//export const BASE_URL = 'https://underbuiltapi.aadhidigital.com';
// import {MilestoneIssue} from '../AddEditModals/AddDecisions';
class MilestoneIssue {
  milestone_issue_id?: number;
  milestone_id?: number;
  project_id?: number;
  issue?: string;
  decision_made?: string;
  is_resolved?: boolean;
  resolved_on?: string; // or Date if you want to use Date type
  description?: string;
  is_active?: boolean;
}
export const GetPMProjects = async (params?: {
  PageNo?: number;
  PageSize?: number;
  ProjectId?: string;
}): Promise<string> => {
  try {
    //////////////debugger;
    // Extract PageNo and PageSize from params, defaulting to undefined if not provided
    const PageNo = params?.PageNo;
    const PageSize = params?.PageSize === 0 ? '' : params?.PageSize;
    const ProjectId = params?.ProjectId;

    // Base URL for the API
    const baseUri = `${BASE_URL}/projectDetails/get_pm_project?is_active=true`;

    // Append pagination parameters only if they are provided
    const uri = `${baseUri}${ProjectId ? `&project_id=${ProjectId}` : ''}${
      PageNo ? `&PageNo=${PageNo}` : ''
    }${PageSize ? `&PageSize=${PageSize}` : ''}`;

    // Retrieve token from storage
    const token = await localStorage.getItem('Token');
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

export const GetPMSearchedProjects = async (
  PageNo: number,
  PageSize: number,
  query: string,
): Promise<string> => {
  try {
    const uri = `${BASE_URL}/projectDetails/get_pm_project?project_id=${encodeURIComponent(
      query,
    )}&PageNo=${PageNo}&PageSize=${PageSize}`;

    const token = await localStorage.getItem('Token'); // Retrieve the token from storage
    //console.log('API Request URI:', uri);

    const jsonResult = await GetAsync_with_token(uri, token); // Make the request with the token
    //console.log('API Response:', jsonResult);

    return JSON.stringify(jsonResult ?? ''); // Return the response as a string
  } catch (error) {
    console.error('Error in GetSearchedProjects:', error);
    throw new Error('Failed to fetch searched projects: ' + error);
  }
};
export const GetDashProjectsWithFilters = async (filters: {
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
  raid_priority?: string;
  budget_impact?: string;
  search_common?: string;
}): Promise<string> => {
  try {
    let uri = `${BASE_URL}/projectDetails/get_dashboard_project`;
    ////////////////debugger;
    // Build the query string dynamically from the filters object
    const queryParams = new URLSearchParams();
    if (filters.project_id) {
      queryParams.append('project_id', filters.project_id);
    }
    if (filters.project_name) {
      queryParams.append('project_name', filters.project_name);
    }
    if (filters.program_id) {
      queryParams.append('program_id', filters.program_id);
    }
    if (filters.status) {
      queryParams.append('status', filters.status);
    }
    ////////////debugger;
    if (filters.PageNo) {
      queryParams.append('PageNo', filters.PageNo.toString());
    }
    if (filters.PageSize) {
      queryParams.append('PageSize', filters.PageSize.toString());
    }

    if (filters.budget) {
      queryParams.append('budget', filters.budget);
    }
    if (filters.budget_impact) {
      queryParams.append('budget_impact', filters.budget_impact);
    }
    if (filters.project_manager) {
      queryParams.append('project_manager', filters.project_manager);
    }
    if (filters.project_owner_user) {
      queryParams.append('project_owner_user', filters.project_owner_user);
    }
    if (filters.project_owner_dept) {
      queryParams.append(
        'project_owner_dept_hierarchy',
        filters.project_owner_dept,
      );
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

    if (
      filters.budget_min &&
      filters.budget_min?.toString() !== '3000' &&
      filters.budget_min?.toString() !== ''
    ) {
      queryParams.append('budget_min', filters.budget_min ?? '');
    }
    if (
      filters.budget_max &&
      filters.budget_max?.toString() !== '3000' &&
      filters.budget_max?.toString() !== ''
    ) {
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
    if (filters.raid_priority) {
      queryParams.append('raid_priority', filters.raid_priority);
    }
    if (filters.search_common) {
      queryParams.append('search_common', filters.search_common);
    }
    // Append the query string to the base URL
    uri += `?${queryParams.toString()}`;
    //////////////debugger;
    const token = await localStorage.getItem('Token');
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
export const GetDashResourceWithFilters = async (filters: {
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
  raid_priority?: string;
  availability_range?: string;
}): Promise<string> => {
  try {
    let uri = `${BASE_URL}/chartsApis/get_resources_by_availability_range_table`;
    ////////////////debugger;
    // Build the query string dynamically from the filters object
    const queryParams = new URLSearchParams();
    if (filters.project_id) {
      queryParams.append('project_id', filters.project_id);
    }
    if (filters.project_name) {
      queryParams.append('project_name', filters.project_name);
    }
    if (filters.program_id) {
      queryParams.append('program_id', filters.program_id);
    }
    if (filters.status) {
      queryParams.append('status', filters.status);
    }
    ////////////debugger;
    if (filters.PageNo) {
      queryParams.append('PageNo', filters.PageNo.toString());
    }
    if (filters.PageSize) {
      queryParams.append('PageSize', filters.PageSize.toString());
    }

    if (filters.budget) {
      queryParams.append('budget', filters.budget);
    }
    if (filters.availability_range) {
      queryParams.append('availability_range', filters.availability_range);
    }
    if (filters.project_manager) {
      queryParams.append('project_manager', filters.project_manager);
    }
    if (filters.project_owner_user) {
      queryParams.append('project_owner_user', filters.project_owner_user);
    }
    if (filters.project_owner_dept) {
      queryParams.append(
        'project_owner_dept_hierarchy',
        filters.project_owner_dept,
      );
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

    if (
      filters.budget_min &&
      filters.budget_min?.toString() !== '3000' &&
      filters.budget_min?.toString() !== ''
    ) {
      queryParams.append('budget_min', filters.budget_min ?? '');
    }
    if (
      filters.budget_max &&
      filters.budget_max?.toString() !== '3000' &&
      filters.budget_max?.toString() !== ''
    ) {
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
    if (filters.raid_priority) {
      queryParams.append('raid_priority', filters.raid_priority);
    }
    // Append the query string to the base URL
    uri += `?${queryParams.toString()}`;
    //////////////debugger;
    const token = await localStorage.getItem('Token');
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
export const GetPMProjectsWithFilters = async (filters: {
  PageNo?: number;
  PageSize?: number;
  project_name?: string;
  program?: string;
  program_id?: string;
  status?: string;
  project_id?: string;
  budget?: string;
  project_manager?: string;
  project_owner_user?: string;
  project_owner_dept?: string;
  goal?: string;
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
    let uri = `${BASE_URL}/projectDetails/get_pm_project`;
    ////////////////debugger;
    // Build the query string dynamically from the filters object
    const queryParams = new URLSearchParams();
    if (filters.project_id) {
      queryParams.append('project_id', filters.project_id);
    }
    if (filters.project_name) {
      queryParams.append('project_name', filters.project_name);
    }
    if (filters.program) {
      queryParams.append('program_id', filters.program);
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
    if (filters.goal) {
      queryParams.append('goal_id', filters.goal);
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

    if (
      filters.budget_min &&
      filters.budget_min?.toString() !== '3000' &&
      filters.budget_min?.toString() !== ''
    ) {
      queryParams.append('budget_min', filters.budget_min ?? '');
    }
    if (
      filters.budget_max &&
      filters.budget_max?.toString() !== '3000' &&
      filters.budget_max?.toString() !== ''
    ) {
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
    //////////////debugger;
    const token = await localStorage.getItem('Token');
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
export const AddFieldEdit = async (values: object): Promise<string> => {
  try {
    //
    //const UserID = await localStorage.getItem('UserID');
    const uri = `${BASE_URL}/projectDetails/upsert_field_change`;
    //const uri = 'https://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = await localStorage.getItem('Token');
    //console.log(uri);
    const payload = JSON.stringify(values);
    //console.log(payload);
    const jsonResult = await PostAsync_with_token(uri, payload, token);
    //
    //
    //console.log(jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const GetPlanChangeProjects = async (params?: {
  PageNo?: number;
  PageSize?: number;
  ProjectId?: string;
}): Promise<string> => {
  ////////////////////debugger;
  try {
    // Extract PageNo and PageSize from params, defaulting to undefined if not provided
    const PageNo = params?.PageNo;
    const PageSize = params?.PageSize;
    const ProjectId = params?.ProjectId;

    // Base URL for the API
    const baseUri = `${BASE_URL}/projectDetails/get_field_change_approval_to_user_for_action?is_active=true`;

    // Append pagination parameters only if they are provided
    const uri = `${baseUri}${ProjectId ? `&project_id=${ProjectId}` : ''}${
      PageNo ? `&PageNo=${PageNo}` : ''
    }${PageSize ? `&PageSize=${PageSize}` : ''}`;

    // Retrieve token from storage
    const token = await localStorage.getItem('Token');
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

export const GetPlanChangeSearchedProjects = async (
  PageNo: number,
  PageSize: number,
  query: string,
): Promise<string> => {
  try {
    const uri = `${BASE_URL}/projectDetails/get_field_change_approval_to_user_for_action?project_name=${encodeURIComponent(
      query,
    )}&PageNo=${PageNo}&PageSize=${PageSize}`;

    const token = await localStorage.getItem('Token'); // Retrieve the token from storage
    //console.log('API Request URI:', uri);

    const jsonResult = await GetAsync_with_token(uri, token); // Make the request with the token
    //console.log('API Response:', jsonResult);

    return JSON.stringify(jsonResult ?? ''); // Return the response as a string
  } catch (error) {
    console.error('Error in GetSearchedProjects:', error);
    throw new Error('Failed to fetch searched projects: ' + error);
  }
};

export const GetPlanChangeProjectsWithFilters = async (filters: {
  PageNo?: number;
  PageSize?: number;
  status?: string;
  budget?: string;
  project_manager?: string;
  project_owner_user?: string;
  project_owner_dept?: string;
  goal_id?: string;
  golive_date?: string;
}): Promise<string> => {
  try {
    let uri = `${BASE_URL}/projectDetails/get_field_change_approval_to_user_for_action`;

    // Build the query string dynamically from the filters object
    const queryParams = new URLSearchParams();

    if (filters.PageNo) queryParams.append('PageNo', filters.PageNo.toString());
    if (filters.PageSize)
      queryParams.append('PageSize', filters.PageSize.toString());
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.budget) queryParams.append('budget', filters.budget);
    if (filters.project_manager)
      queryParams.append('project_manager', filters.project_manager);
    if (filters.project_owner_user)
      queryParams.append('project_owner_user', filters.project_owner_user);
    if (filters.project_owner_dept)
      queryParams.append('project_owner_dept', filters.project_owner_dept);
    if (filters.goal_id) queryParams.append('goal_id', filters.goal_id);
    if (filters.golive_date)
      queryParams.append('golive_date', filters.golive_date);

    // Append the query string to the base URL
    uri += `?${queryParams.toString()}`;

    const token = await localStorage.getItem('Token');
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

export const get_field_change_requests = async (
  query: string,
  project_id: number,
): Promise<string> => {
  try {
    const uri =
      `${BASE_URL}/projectDetails/get_field_change_requests?project_id=` +
      project_id +
      '&field_id=' +
      query;
    const token = await localStorage.getItem('Token');
    //console.log(uri);
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
export const ApproveFieldEditRequest = async (
  values: object,
): Promise<string> => {
  try {
    //
    //const UserID = await localStorage.getItem('UserID');
    const uri = `${BASE_URL}/projectDetails/approve_field_change`;
    //const uri = 'https://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = await localStorage.getItem('Token');
    //console.log(uri);
    const payload = JSON.stringify(values);
    //console.log(payload);
    const jsonResult = await PostAsync_with_token(uri, payload, token);
    //
    //
    //console.log(jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const GetClosedProjects = async (params?: {
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
    const baseUri = `${BASE_URL}/projectDetails/get_closed_project?is_active=true`;

    // Append pagination parameters only if they are provided
    const uri = `${baseUri}${ProjectId ? `&project_id=${ProjectId}` : ''}${
      PageNo ? `&PageNo=${PageNo}` : ''
    }${PageSize ? `&PageSize=${PageSize}` : ''}`;

    // Retrieve token from storage
    const token = await localStorage.getItem('Token');
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

export const GetClosedProjectsSearched = async (
  PageNo: number,
  PageSize: number,
  query: string,
): Promise<string> => {
  try {
    const uri = `${BASE_URL}/projectDetails/get_closed_project?project_name=${encodeURIComponent(
      query,
    )}&PageNo=${PageNo}&PageSize=${PageSize}`;

    const token = await localStorage.getItem('Token'); // Retrieve the token from storage
    //console.log('API Request URI:', uri);

    const jsonResult = await GetAsync_with_token(uri, token); // Make the request with the token
    //console.log('API Response:', jsonResult);

    return JSON.stringify(jsonResult ?? ''); // Return the response as a string
  } catch (error) {
    console.error('Error in GetSearchedProjects:', error);
    throw new Error('Failed to fetch searched projects: ' + error);
  }
};

export const GetClosedProjectsWithFilters = async (filters: {
  PageNo?: number;
  PageSize?: number;
  project_id?: string;
  status?: string;
  budget?: string;
  project_manager?: string;
  project_owner_user?: string;
  project_owner_dept?: string;
  goal_id?: string;
  golive_date?: string;
}): Promise<string> => {
  try {
    let uri = `${BASE_URL}/projectDetails/get_closed_project`;

    // Build the query string dynamically from the filters object
    const queryParams = new URLSearchParams();

    if (filters.PageNo) queryParams.append('PageNo', filters.PageNo.toString());
    if (filters.PageSize)
      queryParams.append('PageSize', filters.PageSize.toString());
    if (filters.project_id) {
      queryParams.append('project_id', filters.project_id);
    }
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.budget) queryParams.append('budget', filters.budget);
    if (filters.project_manager)
      queryParams.append('project_manager', filters.project_manager);
    if (filters.project_owner_user)
      queryParams.append('project_owner_user', filters.project_owner_user);
    if (filters.project_owner_dept)
      queryParams.append('project_owner_dept', filters.project_owner_dept);
    if (filters.goal_id) queryParams.append('goal_id', filters.goal_id);
    if (filters.golive_date)
      queryParams.append('golive_date', filters.golive_date);

    // Append the query string to the base URL
    uri += `?${queryParams.toString()}`;

    const token = await localStorage.getItem('Token');
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

export const get_project_counts_by_status = async (
  project_id: string,
  query: string,
  depat: string,
  project_start_date: string,
  project_end_date: string,
): Promise<string> => {
  try {
    ////////debugger
    //const UserID = await localStorage.getItem('UserID');

    let uri = `${BASE_URL}/chartsApis/get_project_counts_by_status`;

    // Build the query string dynamically from the filters object
    const queryParams = new URLSearchParams();
    if (project_id) {
      queryParams.append('project_id', project_id?.toString());
    }
    if (query) {
      queryParams.append('status_id', query?.toString());
    }
    if (depat) {
      queryParams.append('parent_department_id', depat?.toString());
    }
    if (project_start_date) {
      queryParams.append('project_start_date', project_start_date?.toString());
    }
    if (project_end_date) {
      queryParams.append('project_end_date', project_end_date?.toString());
    }

    // Append the query string to the base URL
    uri += `?${queryParams.toString()}`;

    // const uri = `${BASE_URL}/projectInProgress/get_project_counts_by_status?parent_department_id=${depat}&status_id=${query}`;
    // const uri = `${BASE_URL}/projectInProgress/get_project_counts_by_status?parent_department_id=${depat}&status_id=${query}`;
    //const uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = await localStorage.getItem('Token');
    //console.log(uri);
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    ////////debugger
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
export const get_project_Budget = async (
  project_id: string,
  query: string,
  depat: string,
  project_start_date: string,
  project_end_date: string,
  budget_impact: string,
): Promise<string> => {
  try {
    ////////debugger
    //const UserID = await localStorage.getItem('UserID');

    let uri = `${BASE_URL}/chartsApis/get_departments_budget`;

    // Build the query string dynamically from the filters object
    const queryParams = new URLSearchParams();
    if (project_id) {
      queryParams.append('project_id', project_id?.toString());
    }
    if (query) {
      queryParams.append('status', query?.toString());
    }
    if (depat) {
      queryParams.append('parent_department_id', depat?.toString());
    }
    if (budget_impact) {
      queryParams.append('budget_impact', budget_impact?.toString());
    }
    if (project_start_date) {
      queryParams.append('project_start_date', project_start_date?.toString());
    }
    if (project_end_date) {
      queryParams.append('project_end_date', project_end_date?.toString());
    }

    // Append the query string to the base URL
    uri += `?${queryParams.toString()}`;

    // const uri = `${BASE_URL}/projectInProgress/get_project_counts_by_status?parent_department_id=${depat}&status_id=${query}`;
    // const uri = `${BASE_URL}/projectInProgress/get_project_counts_by_status?parent_department_id=${depat}&status_id=${query}`;
    //const uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = await localStorage.getItem('Token');
    //console.log(uri);
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    ////////debugger
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
//   query: string,
//   depat: string,
//   project_start_date: string,
//   project_end_date: string,
// ): Promise<string> => {
//   try {
//     ////////debugger
//     //const UserID = await localStorage.getItem('UserID');

//     let uri = `${BASE_URL}/projectInProgress/get_resources_availability_breakdown`;

//     // Build the query string dynamically from the filters object
//     const queryParams = new URLSearchParams();

//     if (query) {
//       queryParams.append('status_id', query?.toString());
//     }
//     if (depat) {
//       queryParams.append('parent_department_id', depat?.toString());
//     }
//     if (project_start_date) {
//       queryParams.append('project_start_date', project_start_date?.toString());
//     }
//     if (project_end_date) {
//       queryParams.append('project_end_date', project_end_date?.toString());
//     }

//     // Append the query string to the base URL
//     uri += `?${queryParams.toString()}`;

//     // const uri = `${BASE_URL}/projectInProgress/get_project_counts_by_status?parent_department_id=${depat}&status_id=${query}`;
//     // const uri = `${BASE_URL}/projectInProgress/get_project_counts_by_status?parent_department_id=${depat}&status_id=${query}`;
//     //const uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
//     const token = await localStorage.getItem('Token');
//     //console.log(uri);
//     const jsonResult = await GetAsync_with_token(uri, token);
//     //console.log(jsonResult);
//     ////////debugger
//     return JSON.stringify(jsonResult ?? '');
//   } catch (error) {
//     console.error(error);
//     throw Error('Failed' + error);
//   }
// };

export const get_project_Budget_Impact = async (
  project_id: string,
  query: string,
  depat: string,
  project_start_date: string,
  project_end_date: string,
  budget_impact: string,
): Promise<string> => {
  try {
    ////////debugger
    //const UserID = await localStorage.getItem('UserID');

    let uri = `${BASE_URL}/chartsApis/get_departments_budget_impact`;

    // Build the query string dynamically from the filters object
    const queryParams = new URLSearchParams();
    if (project_id) {
      queryParams.append('project_id', project_id?.toString());
    }
    if (query) {
      queryParams.append('status_id', query?.toString());
    }

    if (depat) {
      queryParams.append('parent_department_id', depat?.toString());
    }
    if (budget_impact) {
      queryParams.append('budget_impact', budget_impact?.toString());
    }
    if (project_start_date) {
      queryParams.append('project_start_date', project_start_date?.toString());
    }
    if (project_end_date) {
      queryParams.append('project_end_date', project_end_date?.toString());
    }

    // Append the query string to the base URL
    uri += `?${queryParams.toString()}`;

    // const uri = `${BASE_URL}/projectInProgress/get_project_counts_by_status?parent_department_id=${depat}&status_id=${query}`;
    // const uri = `${BASE_URL}/projectInProgress/get_project_counts_by_status?parent_department_id=${depat}&status_id=${query}`;
    //const uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = await localStorage.getItem('Token');
    //console.log(uri);
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    ////////debugger
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const get_project_Budget_Impact_BO = async (
  project_id: string,
  query: string,
  depat: string,
  project_start_date: string,
  project_end_date: string,
  budget_impact: string,
): Promise<string> => {
  try {
    ////////debugger
    //const UserID = await localStorage.getItem('UserID');

    let uri = `${BASE_URL}/chartsApis/get_departments_budget_impact_business_owner`;

    // Build the query string dynamically from the filters object
    const queryParams = new URLSearchParams();
    if (project_id) {
      queryParams.append('project_id', project_id?.toString());
    }
    if (query) {
      queryParams.append('status_id', query?.toString());
    }
    if (depat) {
      queryParams.append('parent_department_id', depat?.toString());
    }
    if (budget_impact) {
      queryParams.append('budget_impact', budget_impact?.toString());
    }
    if (project_start_date) {
      queryParams.append('project_start_date', project_start_date?.toString());
    }
    if (project_end_date) {
      queryParams.append('project_end_date', project_end_date?.toString());
    }

    // Append the query string to the base URL
    uri += `?${queryParams.toString()}`;

    // const uri = `${BASE_URL}/projectInProgress/get_project_counts_by_status?parent_department_id=${depat}&status_id=${query}`;
    // const uri = `${BASE_URL}/projectInProgress/get_project_counts_by_status?parent_department_id=${depat}&status_id=${query}`;
    //const uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = await localStorage.getItem('Token');
    //console.log(uri);
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    ////////debugger
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const get_departments_projects_Resource = async (
  project_id: string,
  query: string,
  depat: string,
  project_start_date: string,
  project_end_date: string,
): Promise<string> => {
  try {
    ////////debugger
    //const UserID = await localStorage.getItem('UserID');
    let uri = `${BASE_URL}/chartsApis/get_resource_projects_map`;
    const queryParams = new URLSearchParams();
    if (project_id) {
      queryParams.append('project_id', project_id?.toString());
    }
    if (query) {
      queryParams.append('status', query?.toString());
    }
    if (depat) {
      queryParams.append('parent_department_id', depat?.toString());
    }
    if (project_start_date) {
      queryParams.append('project_start_date', project_start_date?.toString());
    }
    if (project_end_date) {
      queryParams.append('project_end_date', project_end_date?.toString());
    }

    // Append the query string to the base URL
    uri += `?${queryParams.toString()}`;
    //const uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = await localStorage.getItem('Token');
    //console.log(uri);
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    ////////debugger
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const get_departments_projects_Budget = async (
  project_id: string,
  query: string,
  depat: string,
  project_start_date: string,
  project_end_date: string,
  budget_impact?: string,
): Promise<string> => {
  try {
    ////////debugger
    //const UserID = await localStorage.getItem('UserID');
    let uri = `${BASE_URL}/chartsApis/get_departments_budget_monthwise_breakdown`;
    const queryParams = new URLSearchParams();
    if (project_id) {
      queryParams.append('project_id', project_id?.toString());
    }
    if (query) {
      queryParams.append('status', query?.toString());
    }
    if (budget_impact) {
      queryParams.append('budget_impact', budget_impact?.toString());
    }
    if (depat) {
      queryParams.append('parent_department_id', depat?.toString());
    }
    if (project_start_date) {
      queryParams.append('project_start_date', project_start_date?.toString());
    }
    if (project_end_date) {
      queryParams.append('project_end_date', project_end_date?.toString());
    }

    // Append the query string to the base URL
    uri += `?${queryParams.toString()}`;
    //const uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = await localStorage.getItem('Token');
    //console.log(uri);
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    ////////debugger
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
export const get_departments_projects = async (
  project_id: string,
  query: string,

  depat: string,
  project_start_date: string,
  project_end_date: string,
): Promise<string> => {
  try {
    ////////debugger
    //const UserID = await localStorage.getItem('UserID');
    let uri = `${BASE_URL}/chartsApis/get_departments_projects`;
    const queryParams = new URLSearchParams();
    if (project_id) {
      queryParams.append('project_id', project_id?.toString());
    }
    if (query) {
      queryParams.append('status', query?.toString());
    }
    if (depat) {
      queryParams.append('parent_department_id', depat?.toString());
    }
    if (project_start_date) {
      queryParams.append('project_start_date', project_start_date?.toString());
    }
    if (project_end_date) {
      queryParams.append('project_end_date', project_end_date?.toString());
    }

    // Append the query string to the base URL
    uri += `?${queryParams.toString()}`;
    //const uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = await localStorage.getItem('Token');
    //console.log(uri);
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    ////////debugger
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const get_project_ResurceAvailability = async (
  project_id: string,
  query: string,
  depat: string,
  project_start_date: string,
  project_end_date: string,
): Promise<string> => {
  try {
    ////////debugger
    //const UserID = await localStorage.getItem('UserID');

    let uri = `${BASE_URL}/chartsApis/get_resources_availability_breakdown`;

    // Build the query string dynamically from the filters object
    const queryParams = new URLSearchParams();
    if (project_id) {
      queryParams.append('project_id', project_id?.toString());
    }
    if (query) {
      queryParams.append('status_id', query?.toString());
    }
    if (depat) {
      queryParams.append('parent_department_id', depat?.toString());
    }
    if (project_start_date) {
      queryParams.append('project_start_date', project_start_date?.toString());
    }
    if (project_end_date) {
      queryParams.append('project_end_date', project_end_date?.toString());
    }

    // Append the query string to the base URL
    uri += `?${queryParams.toString()}`;

    // const uri = `${BASE_URL}/projectInProgress/get_project_counts_by_status?parent_department_id=${depat}&status_id=${query}`;
    // const uri = `${BASE_URL}/projectInProgress/get_project_counts_by_status?parent_department_id=${depat}&status_id=${query}`;
    //const uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = await localStorage.getItem('Token');
    //console.log(uri);
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    ////////debugger
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const get_project_ResurceAvailability_MonthWise = async (
  project_id: string,
  query: string,
  depat: string,
  project_start_date: string,
  project_end_date: string,
): Promise<string> => {
  try {
    ////////debugger
    //const UserID = await localStorage.getItem('UserID');

    let uri = `${BASE_URL}/chartsApis/get_resources_availability_monthwise_breakdown`;

    // Build the query string dynamically from the filters object
    const queryParams = new URLSearchParams();
    if (project_id) {
      queryParams.append('project_id', project_id?.toString());
    }
    if (query) {
      queryParams.append('status_id', query?.toString());
    }
    if (depat) {
      queryParams.append('parent_department_id', depat?.toString());
    }
    if (project_start_date) {
      queryParams.append('project_start_date', project_start_date?.toString());
    }
    if (project_end_date) {
      queryParams.append('project_end_date', project_end_date?.toString());
    }

    // Append the query string to the base URL
    uri += `?${queryParams.toString()}`;

    // const uri = `${BASE_URL}/projectInProgress/get_project_counts_by_status?parent_department_id=${depat}&status_id=${query}`;
    // const uri = `${BASE_URL}/projectInProgress/get_project_counts_by_status?parent_department_id=${depat}&status_id=${query}`;
    //const uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = await localStorage.getItem('Token');
    //console.log(uri);
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    ////////debugger
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const getDecision = async (
  query: number,
  issue_id?: number,
): Promise<string> => {
  try {
    ////////debugger
    //const UserID = await localStorage.getItem('UserID');
    const uri = `${BASE_URL}/projectInProgress/get_milestone_issues?is_active=true&project_id=${query}&milestone_issue_id=${
      issue_id ?? ''
    }`;
    //const uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = await localStorage.getItem('Token');
    //console.log(uri);
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    ////////debugger
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
export const get_projects_autocomplete = async (
  query: string,
  status_type: string = 'all',
): Promise<string> => {
  try {
    ////////debugger
    //const UserID = await localStorage.getItem('UserID');
    const uri = `${BASE_URL}/projectFlow/get_projects_autocomplete?status_type=${status_type}&search_common=${query}`;
    //const uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = await localStorage.getItem('Token');
    //console.log(uri);
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    ////////debugger
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const get_resources_autocomplete = async (
  query: string,
  status_type: string = 'all',
): Promise<string> => {
  try {
    ////////debugger
    //const UserID = await localStorage.getItem('UserID');
    const uri = `${BASE_URL}/projectFlow/get_resources_autocomplete?status_type=${status_type}&search_common=${query}`;
    //const uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = await localStorage.getItem('Token');
    //console.log(uri);
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    ////////debugger
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const Deletedecision = async (raidId: number): Promise<string> => {
  try {
    const uri = `${BASE_URL}/projectInProgress/delete_milestone_issue`;
    const token = await localStorage.getItem('Token');
    //console.log(uri);
    const payload = JSON.stringify({milestone_issue_id: raidId});
    //console.log(payload);
    const jsonResult = await PostAsync_with_token(uri, payload, token);
    //console.log(jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed to delete RAID: ' + error);
  }
};

export const InsertIssueDecision = async (
  values: MilestoneIssue,
): Promise<string> => {
  try {
    const uri = `${BASE_URL}/projectInProgress/upsert_milestone_issue`;
    const token = await localStorage.getItem('Token');
    //console.log(uri);
    const payload = JSON.stringify(values);
    //console.log(payload);
    const jsonResult = await PostAsync_with_token(uri, payload, token);
    //console.log(jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed to insert RAID: ' + error);
  }
};
export const AddCustomerUser = async (values: any): Promise<string> => {
  try {
    //////////////debugger;
    const url = `${BASE_URL}/${
      values.customer_id ? 'master/insert_customer' : 'auth/Register'
    }`;
    const uri = url;
    const token = await localStorage.getItem('Token');
    //console.log(uri);
    const payload = JSON.stringify(values);
    //console.log(payload);
    const jsonResult = await PostAsync_with_token(uri, payload, token);
    //console.log(jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed to insert RAID: ' + error);
  }
};
export const UpdateTerms = async (): Promise<string> => {
  try {
    //////////////debugger;
    const url = `${BASE_URL}/master/common_task`;
    const uri = url;
    const token = await localStorage.getItem('Token');
    //console.log(uri);
    const payload = JSON.stringify({type: 'terms'});
    //console.log(payload);
    const jsonResult = await PostAsync_with_token(uri, payload, token);
    //console.log(jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed to insert RAID: ' + error);
  }
};
export const UpdateRole = async (role: any): Promise<string> => {
  try {
    //////////////debugger;
    const url = `${BASE_URL}/master/common_task`;
    const uri = url;
    const token = await localStorage.getItem('Token');
    //console.log(uri);
    const payload = JSON.stringify({type: 'role', role_id: role});
    //console.log(payload);
    const jsonResult = await PostAsync_with_token(uri, payload, token);
    //console.log(jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed to insert RAID: ' + error);
  }
};

export const InsertColumnVisibility = async (values: any): Promise<string> => {
  try {
    values.map(async (item: any, index: number) => {
      const uri = `${BASE_URL}/customeradmin/upsert_column_visibility`;
      const token = await localStorage.getItem('Token');
      //console.log(uri);
      const payload = JSON.stringify(item);
      //console.log(payload);
      const jsonResult = await PostAsync_with_token(uri, payload, token);
    });

    //console.log(jsonResult);
    return JSON.stringify('');
  } catch (error) {
    console.error(error);
    throw Error('Failed to insert RAID: ' + error);
  }
};

export const GetColumnVisibility = async (query: string): Promise<string> => {
  try {
    ////////debugger
    //const UserID = await localStorage.getItem('UserID');
    const uri = `${BASE_URL}/customeradmin/get_column_visibility?url=${query}`;
    //const uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = await localStorage.getItem('Token');
    //console.log(uri);
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    ////////debugger
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
export const GetProjectAudit = async (
  project_id: number,
  PageNo: number,
  PageSize: number,
): Promise<string> => {
  try {
    const uri = `${BASE_URL}/projectDetails/get_project_change_report?project_id=${encodeURIComponent(
        project_id,
    )}&PageNo=${PageNo}&PageSize=${PageSize}`;

    const token =  localStorage.getItem('Token'); // Retrieve the token from storage
    //console.log('API Request URI:', uri);

    const jsonResult = await GetAsync_with_token(uri, token); // Make the request with the token
    //console.log('API Response:', jsonResult);

    return JSON.stringify(jsonResult ?? ''); // Return the response as a string
  } catch (error) {
    console.error('Error in GetSearchedProjects:', error);
    throw new Error('Failed to fetch searched projects: ' + error);
  }
};
export const FetchallProj = async (query: any): Promise<string> => {
  try {
    ////////debugger
    //const UserID = await AsyncStorage.getItem('UserID');
    //let customerId = await getCustomerId();
    const uri = `${BASE_URL}/projectFlow/get_all_project_details?project_id=${query}`;
    //var uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token =  localStorage.getItem('Token');
    //console.log(uri);
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    ////////debugger
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
export const GetMasterData = async (): Promise<string> => {
  try {
    ////////debugger
    //const UserID = await localStorage.getItem('UserID');
    const uri = `${BASE_URL}/customeradmin/get_master_data`;
    //const uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = await localStorage.getItem('Token');
    //console.log(uri);
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    ////////debugger
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
export const GetApprovers = async (projectID: string): Promise<string> => {
  try {
    ////////debugger
    //const UserID = await localStorage.getItem('UserID');
    const uri = `${BASE_URL}/utils/get_project_approvers?project_id=${projectID}`;
    //const uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = await localStorage.getItem('Token');
    //console.log(uri);
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    ////////debugger
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
export const GetMasterDataPM = async (query: string): Promise<string> => {
  try {
    ////////debugger
    //const UserID = await localStorage.getItem('UserID');
    const uri = `${BASE_URL}/customeradmin/get_user_master_data?url=${query}`;
    //const uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = await localStorage.getItem('Token');
    //console.log(uri);
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    ////////debugger
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const GetRAIDBubble = async (
  project_id: string,
  screen: string,
  startDate?: string,
  endDate?: string,
  status?: string,
  dept?: string,
): Promise<string> => {
  try {
    const token = await localStorage.getItem('Token');

    // Build query parameters
    const params = new URLSearchParams();
    params.append('url', screen); // usually "RaidTracker"
    if (project_id) params.append('project_id', project_id);
    if (status) params.append('status_id', status);
    if (dept) params.append('project_owner_dept_hierarchy', dept);
    if (startDate) params.append('project_start_date', startDate);
    if (endDate) params.append('project_end_date', endDate);

    const uri = `${BASE_URL}/chartsApis/raid_priority_project_chart?${params.toString()}`;

    const jsonResult = await GetAsync_with_token(uri, token);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed: ' + error);
  }
};
