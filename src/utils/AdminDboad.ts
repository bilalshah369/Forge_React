const BASE_URL = import.meta.env.VITE_BASE_URL;
const APP_URL = import.meta.env.REACT_APP_APP_URL;
//import { navigationRef } from "../navigations/RootNavigation";

import { navigationRef } from "./navigationService";
import {GetAsync_with_token,PostAsync,
   PostAsync_with_token} from '../services/rest_api_service'
   export const MainDrawerNav = async (query:string): Promise<string> => {
    try {
      ////////debugger
      //const UserID = await AsyncStorage.getItem('UserID');
      const uri = `${BASE_URL}/master/role_modules?role_id=${query}`;
      //var uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
      const token =  localStorage.getItem('Token');
      //console.log(uri);``
      const jsonResult = await GetAsync_with_token(uri, token);
      //console.log(jsonResult);
      ////////debugger
      //console.log("jsonResult from API:", jsonResult);
      return JSON.stringify(jsonResult ?? '');
    } catch (error) {
      console.error(error);
      throw Error('Failed' + error);
    }
  };
export const GetutilizedResource = async (
  project_id:string,
  query: string,
  depat: string,
  project_start_date: string,
  project_end_date: string,
): Promise<string> => {
  try {
    ////////debugger
    //const UserID = await localStorage.getItem('UserID');
    let uri = `${BASE_URL}/chartsApis/resource_utilization`;
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
    //let uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
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
export const getChartsData = async (): Promise<string> => {
  try {
    ////////debugger
    //const UserID = await localStorage.getItem('UserID');
    const uri = `${BASE_URL}/chartsApis/initial_data_load`;
    //let uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
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

export const GetBOChartData = async (): Promise<string> => {
  try {
    const uri = `${BASE_URL}/chartsApis/initial_data_load_business_owner`;
    const token = await localStorage.getItem('Token');
    const jsonResult = await GetAsync_with_token(uri, token);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const get_departments_projects_BO = async (
  project_id:string,
  query: string,
  depat: string,
  project_start_date: string,
  project_end_date: string,
): Promise<string> => {
  try {
    let uri = `${BASE_URL}/chartsApis/get_departments_projects_business_owner`;
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

    uri += `?${queryParams.toString()}`;
    const token = await localStorage.getItem('Token');
    const jsonResult = await GetAsync_with_token(uri, token);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const get_project_counts_by_status_BO = async (
  project_id:string,
  query: string,
  depat: string,
  project_start_date: string,
  project_end_date: string,
): Promise<string> => {
  try {
    let uri = `${BASE_URL}/chartsApis/get_project_counts_by_status_business_owner`;

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

    uri += `?${queryParams.toString()}`;

    const token = await localStorage.getItem('Token');
    const jsonResult = await GetAsync_with_token(uri, token);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const GetBORaidData = async (
  screen: string,
  startDate?: string,
  endDate?: string,
  status?: string,
  dept?: string,
): Promise<string> => {
  try {
    const token = await localStorage.getItem('Token');
    const params = new URLSearchParams();
    params.append('url', screen); // usually "RaidTracker"
    if (status) params.append('status', status);
    if (dept) params.append('business_stakeholder_dept_hierarchy', dept);
    if (startDate) params.append('project_start_date', startDate);
    if (endDate) params.append('project_end_date', endDate);

    const uri = `${BASE_URL}/chartsApis/raid_priority_project_chart?${params.toString()}`;

    const jsonResult = await GetAsync_with_token(uri, token);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const GetBOProjectsWithFilters = async (filters: {
  PageNo?: number;
  PageSize?: number;
  project_name?: string;
  program_id?: string;
  status?: string;
  project_id?: string;
  budget?: string;
  project_manager?: string;
  project_owner_user?: string;
  business_owner_dept?: string;
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
  budget_impact?:string
}): Promise<string> => {
  try {
    let uri = `${BASE_URL}/chartsApis/get_dashboard_project_business_owner`;
    ////////////debugger;
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
    if (filters.budget_impact) {
      queryParams.append('budget_impact', filters.budget_impact);
    }
    if (filters.status) {
      queryParams.append('status', filters.status);
    }
    ////////debugger;
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
    if (filters.business_owner_dept) {
      queryParams.append(
        'business_stakeholder_dept_hierarchy',
        filters.business_owner_dept,
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
    //////////debugger;
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
