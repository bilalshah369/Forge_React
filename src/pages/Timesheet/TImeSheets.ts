/* eslint-disable no-var */
import {
  GetAsync_with_token,
  PostAsync,
  PostAsync_with_token,
} from '../../services/rest_api_service';
//export const BASE_URL = 'https://underbuiltapi.aadhidigital.com';
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const GetTimesheet = async (query: string): Promise<string> => {
  try {
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/projectDetails/get_user_workspace_project`;
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

export const GetAllResourcesTimesheets = async (query: {
  resource_id?: string;
  parent_department_id?: string;
  PageNo?: number | undefined;
  PageSize?: number | undefined;
  status?: string;
  project_start_date?: string;
  project_end_date?: string;
  project_id?: string;
  search_common?: string;
}): Promise<string> => {
  try {
    var uri = `${BASE_URL}/projectDetails/get_all_resources_timesheet?`;
    const token = localStorage.getItem('Token');
    if (query.resource_id) {
      uri += `&resource_id=${query.resource_id}`;
    }
    if (query.parent_department_id) {
      uri += `&parent_department_id=${query.parent_department_id}`;
    }
    if (query.PageNo) {
      uri += `&PageNo=${query.PageNo}`;
    }
    if (query.PageSize) {
      uri += `&PageSize=${query.PageSize}`;
    }
    if (query.status) {
      uri += `&status=${query.status}`;
    }
    if (query.project_start_date) {
      uri += `&project_start_date=${query.project_start_date}`;
    }
    if (query.project_end_date) {
      uri += `&project_end_date=${query.project_end_date}`;
    }
    if (query.project_id) {
      uri += `&project_id=${query.project_id}`;
    }
    if (query.search_common) {
      uri += `&search_common=${query.search_common}`;
    }
    var jsonResult = await GetAsync_with_token(uri, token);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const GetAllProjectsTimesheets = async (query: {
  parent_department_id?: string;
  PageNo?: number | undefined;
  PageSize?: number | undefined;
  status?: string;
  project_start_date?: string;
  project_end_date?: string;
  project_id?: string;
  search_common?: string;
}): Promise<string> => {
  try {
    var uri = `${BASE_URL}/projectDetails/get_all_projects_timesheet?`;
    const token = localStorage.getItem('Token');

    if (query.parent_department_id) {
      uri += `&parent_department_id=${query.parent_department_id}`;
    }
    if (query.PageNo) {
      uri += `&PageNo=${query.PageNo}`;
    }
    if (query.PageSize) {
      uri += `&PageSize=${query.PageSize}`;
    }
    if (query.status) {
      uri += `&status=${query.status}`;
    }
    if (query.project_start_date) {
      uri += `&project_start_date=${query.project_start_date}`;
    }
    if (query.project_end_date) {
      uri += `&project_end_date=${query.project_end_date}`;
    }
    if (query.project_id) {
      uri += `&project_id=${query.project_id}`;
    }
    if (query.search_common) {
      uri += `&search_common=${query.search_common}`;
    }
    var jsonResult = await GetAsync_with_token(uri, token);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
