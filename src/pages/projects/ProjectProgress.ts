/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */
import { decodeBase64 } from '@/utils/securedata';
import {
  GetAsync_with_token,
  PostAsync,
  PostAsync_with_token,
} from '../../services/rest_api_service';
//export const BASE_URL = 'https://underbuiltapi.aadhidigital.com';
const BASE_URL = import.meta.env.VITE_BASE_URL;


export class Project {
  project_id?: number;
  program_id?: number;
  goal_id?: number;
  portfolio_id?: number | null;
  department_id?: number | null;
  project_manager_id?: number;
  project_name?: string;
  project_short_name?: string | null;
  description?: string | null;
  start_date?: Date;
  end_date?: Date;
  golive_date?: Date;
  priority?: number;
  phase?: string | null;
  classification?: string;
  project_owner_user_name?: string;
  business_stakeholder_user_name?: string;
  classification_name?: string;
  initial_budget?: number | null;
  initial_budget_unit?: string | null;
  project_owner_user?: number;
  project_owner_dept?: number;
  business_stakeholder_user?: number;
  business_stakeholder_dept?: number;
  impacted_stakeholder_user?: number | null;
  impacted_stakeholder_dept?: number | null;
  impacted_applications?: string;
  resource_deployed_percentage?: number | null;
  created_at?: Date;
  updated_at?: Date | null;
  is_active?: boolean;
  customer_id?: number;
  project_size?: string;
  budget_size?: string;
  business_desc?: string;
  scope_definition?: string;
  key_assumption?: string;
  benefit_roi?: string;
  risk?: string;
  roi?: string;
  created_by?: number;
  updated_by?: number | null;
  status?: number;
  impacted_function?: string;
  actual_budget?: string | null;
  budget_impact?: number | null;
  budget_impact_name?: string;
  status_name?: string;
  business_stakeholder_dept_name?: string;
  project_owner_dept_name?: string;
  impacted_stakeholder_dept_name?: string | null;
  impacted_function_name?: string;
  created_by_name?: string;
  budget?: string;
  custom_fields?: any | null;
  project_manager_name?: string;
  status_color?: string;
  tasks?: Task[];
  application_name?: string;
  dependent_projects?: string;
  dependent_project_names?: string;
  goal_name?: string;
  program_name?: string;
  project_size_name?: string;
  priority_name?: string;
  customer_project_id?:string
}
export class Task {
  task_id?: number;
  upcoming_task?: string;
  accomplishment?: string;
  is_active?: boolean;
  created_at?: string; // ISO date as string
  updated_at?: string; // ISO date as string
  created_by?: number;
  updated_by?: number | null;
}
const getCustomerId = async () => {
  try {
    const localcustomerID = localStorage.getItem('Customer_ID');
    const decodedCustomerID = decodeBase64(localcustomerID || '');
    //console.log('Your Customer ID is ', decodedCustomerID);
    return decodedCustomerID;  // Assuming setCustomerID is passed to the function
  } catch (err) {
    //console.log('Error fetching the customerID', err);
  }
};
export const GetInprogressProject = async (query: string): Promise<string> => {
  try {
    ////////debugger
    //const UserID = localStorage.getItem('UserID');
    let customerId = await getCustomerId();
    var uri = `${BASE_URL}/projectInProgress/get_inProgress_project?project_id=${query}`;
    //var uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    //console.log(uri);
    var jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    ////////debugger
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const GetInprogressProjectWithPagination = async (
  PageNo: number,
  PageSize: number,
  searchQuery?: string,
): Promise<string> => {
  try {
    ////////debugger
    let customerId = await getCustomerId();
    let uri = `${BASE_URL}/projectInProgress/get_inProgress_project?PageNo=${PageNo}&PageSize=${PageSize}`;

    if (searchQuery && searchQuery.trim() !== '') {
      uri += `&project_name=${encodeURIComponent(searchQuery)}`;
    }
    //var uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    //console.log(uri);
    var jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    ////////debugger
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
export const AddTaskData = async (values: object): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/projectInProgress/upsert_project_task`;
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
export const GetRecentHistoryProject = async (
  query: string,
): Promise<string> => {
  try {
    ////////debugger
    //const UserID = localStorage.getItem('UserID');
    let customerId = await getCustomerId();
    var uri = `${BASE_URL}/projectFlow/get_project_history?project_id=${query}`;
    //var uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    //console.log(uri);
    var jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    ////////debugger
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
export const GetResourceType = async (query: string): Promise<string> => {
  try {
    ////////debugger
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/customeradmin/get_resource_types`;
    const token = localStorage.getItem('Token');
    //console.log(uri);
    var jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    ////////debugger
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
//     ////////debugger
//     //const UserID = localStorage.getItem('UserID');
//     var uri = 'https://underbuiltapi.aadhidigital.com/master/get_users';
//     //var uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
//     const token = localStorage.getItem('Token');
//     //console.log(uri);
//     var jsonResult = await GetAsync_with_token(uri, token);
//     //console.log(jsonResult);
//     ////////debugger
//     return JSON.stringify(jsonResult ?? '');
//   } catch (error) {
//     console.error(error);
//     throw Error('Failed' + error);
//   }
// };

export const GetAdIntegration = async (query: string): Promise<string> => {
  try {
    ////////debugger
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/integration/get_users`;
    //var uri = 'https://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    //console.log(uri);
    var jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    ////////debugger
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
export const GetUserDept = async (query: string): Promise<string> => {
  try {
    ////////debugger
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/master/get_department`;
    //var uri = 'https://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    //console.log(uri);
    var jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    ////////debugger
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
    //////debugger
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

export const GetResourceTimesheet = async (query: string): Promise<string> => {
  try {
    var uri = `${BASE_URL}/approvedProjects/get_project_team_timesheet_userwise?project_id=${query}`;
    const token = localStorage.getItem('Token');
    var jsonResult = await GetAsync_with_token(uri, token);
    return JSON.stringify(jsonResult ?? '');
  } catch (err) {
    console.error(err);
    throw Error('Failed' + err);
  }
};

export const AddResourceTimesheet = async (values: object): Promise<string> => {
  try {
    var uri = `${BASE_URL}/approvedProjects/insert_project_team_timesheet_userwise`;
    const token = localStorage.getItem('Token');
    var payload = JSON.stringify(values);
    var jsonResult = await PostAsync_with_token(uri, payload, token);
    return JSON.stringify(jsonResult ?? '');
  } catch (err) {
    console.error(err);
    throw Error('Failed' + err);
  }
};

export const GetExternalLinks = async (
  project_id: number,
  PageNo?: number,
  PageSize?: number,
): Promise<string> => {
  try {
    var uri = `${BASE_URL}/utils/get_project_links?project_id=${project_id}&PageNo=${PageNo}&PageSize=${PageSize}`;
    const token = localStorage.getItem('Token');
    var jsonResult = await GetAsync_with_token(uri, token);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const AddExternalLinks = async (values: object): Promise<string> => {
  try {
    var uri = `${BASE_URL}/utils/insert_project_link`;
    const token = localStorage.getItem('Token');
    var payload = JSON.stringify(values);
    var jsonResult = await PostAsync_with_token(uri, payload, token);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const DeleteExternalLink = async (link_id: number): Promise<string> => {
  try {
    var uri = `${BASE_URL}/utils/delete_project_link`;
    const token = localStorage.getItem('Token');
    var payload = JSON.stringify({project_link_id: link_id});
    var jsonResult = await PostAsync_with_token(uri, payload, token);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
