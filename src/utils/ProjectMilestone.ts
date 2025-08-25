/* eslint-disable prefer-const */
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
export class Milestone {
  milestone_id?: number;
  project_id?: number;
  milestone_name?: string;
  milestone_description?: string;
  start_date?: Date;
  end_date?: Date;
  actual_start_date?: Date | null;
  actual_end_date?: Date | null;
  milestone_status?: string | null;
  priority?: number;
  short_name?: string;
  last_status?: string | null;
  created_at?: Date;
  updated_at?: Date;
  detail_description?: string;
  progress_days?: number | null;
  total_days?: number | null;
  resource_deployment_type?: string | null;
  resource_deployment_value?: number | null;
  scope_type?: string | null;
  scope_value?: number | null;
  budget_utilization_type?: string | null;
  budget_utilization_value?: number | null;
  weak?: string;
  percent_change?: number;
  task?: string;
  upcomming_task?: string;
  accomplishments?: string;
  history?: History[];
  status_color?:string;
  
}

export class History {
  milestone_id?:number;
  weak?: string;
  percent_change?: number;
  task?: string;
  upcomming_task?: string;
  accomplishments?: string;
  status?: number;
  comment?: string;
  date_of_update?: Date;
  project_id?:number;
  history_status?:number
}

export const GetfetchMilestones = async (query:string): Promise<string> => {
  try {
    //////////debugger
    //const UserID = localStorage.getItem('UserID');
    let customerId = await getCustomerId();
    var uri = `${BASE_URL}/projectInProgress/get_milestone_with_history?project_id=${query}`;
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
export const GetMilestoneStatus = async (query:string): Promise<string> => {
  try {
    //////////debugger
    //const UserID = localStorage.getItem('UserID');
    let customerId = await getCustomerId();
    var uri = `${BASE_URL}/projectInProgress//get_milestone_statuses`;
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
export const GetMilestones = async (query1:string,query2:string): Promise<string> => {
  try {
    //////////debugger
    //const UserID = localStorage.getItem('UserID');
    let customerId = await getCustomerId();
    var uri = `${BASE_URL}/projectInProgress/get_milestone_with_history?project_id=${query1}&milestone_id=${query2}`;
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

export const GetInprogressProject = async (query:string): Promise<string> => {
  try {
    //////////debugger
    //const UserID = localStorage.getItem('UserID');
    let customerId = await getCustomerId();
    var uri = `${BASE_URL}/projectInProgress/get_inProgress_project?customer_id=${customerId}&project_id=${query}`;
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

  export const GetResourceType = async (query:string): Promise<string> => {
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

  export const AddResource  = async (values: object): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/customeradmin/insert_update_resource_user`;
    //var uri = 'https://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    //console.log(uri);
    var payload = JSON.stringify(values);
    //console.log(payload);
       var jsonResult = await PostAsync_with_token(uri, payload,token);
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
       var jsonResult = await PostAsync_with_token(uri, payload,token);
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

  export const GetAdIntegration = async (query:string): Promise<string> => {
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
  export const GetUserDept = async (query:string): Promise<string> => {
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

    export const updateMultipleUsersDepartment  = async (values: object): Promise<string> => {
     
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/customeradmin/update_resource_department`;
    //var uri = 'https://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    //console.log(uri);
    var payload = JSON.stringify(values);
    //console.log(payload);
         var jsonResult = await PostAsync_with_token(uri, payload,token);
    //
    //
    //console.log(jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
    export const updateMultipleUsersRole  = async (values: object): Promise<string> => {
     
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/customeradmin/update_resource_role`;
    //var uri = 'https://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    //console.log(uri);
    var payload = JSON.stringify(values);
    //console.log(payload);
         var jsonResult = await PostAsync_with_token(uri, payload,token);
    //
    //
    //console.log(jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
export const DeleteMultipleUsers  = async (values: object): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/customeradmin/delete_resource`;
    //var uri = 'https://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    //console.log(uri);
    var payload = JSON.stringify(values);
    //console.log(payload);
         var jsonResult = await PostAsync_with_token(uri, payload,token);
    //
    //
    //console.log(jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
export const ConfirmMultipleUsers  = async (values: object): Promise<string> => {
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
         var jsonResult = await PostAsync_with_token(uri, payload,token);
    //
    //
    //console.log(jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
export const AddHistory = async (values: object): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/projectInProgress/upsert_milestone_inprogress`;
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

