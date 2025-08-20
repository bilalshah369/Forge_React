import {
  fetchImageWithAuth,
  GetAsync_with_token,
  PostAsync,
  PostAsync_with_token,
} from '../services/rest_api_service';
import { getCustomerId } from './RoleMaster';
//export const BASE_URL = 'https://underbuiltapi.aadhidigital.com';
const BASE_URL = import.meta.env.VITE_BASE_URL;
export const GetCustomers = async (params?: {
  PageNo?: number;
  PageSize?: number;
  customerID?: number;
  name?: string;
}): Promise<string> => {
  try {
    //var baseUri = `${BASE_URL}/customeradmin/get_customer`;
    var uri = `${BASE_URL}/master/get_customer_details?customer_id=${
      params?.customerID ? params?.customerID : ''
    }${params?.name ? `&search_common=${params?.name}` : ''}${
      params?.PageNo ? `&PageNo=${params?.PageNo}` : ''
    }${params?.PageSize ? `&PageSize=${params?.PageSize}` : ''}`;
    //const uri = `${baseUri}${params?.customerID ? `&customer_id=${params.customerID}` : ''}${params?.name ? `&search_common=${params?.name}` : ''}${params?.PageNo ? `&PageNo=${params?.PageNo}` : ''}${params?.PageSize ? `&PageSize=${params?.PageSize}` : ''}`;
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

export const UpdateCustomer = async (values: Object): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/master/insert_customer`;
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

export const GetCustomersImage = async (values: string): Promise<string> => {
  try {
    const url = `${BASE_URL}/common/images/` + values;
    const fetchedUri = await fetchImageWithAuth(url);
    return fetchedUri ?? '';
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const DeleteCustomer = async (values: Object): Promise<string> => {
  try {
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/master/delete_customer`;
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

//Registration API's - otp verification, add customer, approve/reject customer

export async function GetPendingCustomers() {
  try {
    const uri = `${BASE_URL}/master/get_pending_customer`;
    const token = localStorage.getItem('Token');
    const jsonResult = await GetAsync_with_token(uri, token);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
}

export async function ApproveRejectCustomer(
  customerId: number,
  status: boolean,
) {
  try {
    const payload = JSON.stringify({
      type: 'approve_customer',
      customer_id: customerId,
      is_approve_customer: status,
    });
    var uri = `${BASE_URL}/master/common_task`;
    const token = localStorage.getItem('Token');
    const jsonResult = await PostAsync_with_token(uri, payload, token);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
}

export const UpdateMailer  = async (values: Object): Promise<string> => {
    try {
      // 
       //const UserID = await AsyncStorage.getItem('UserID');
       var uri = `${BASE_URL}/customeradmin/upsert_customer_mailer`;
       //var uri = 'https://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
       const token = localStorage.getItem('Token'); 
       console.log('backnd mailer TOEKEN', token); 
       var payload = JSON.stringify(values);
       console.log('backnd mailer payload', payload);
       var jsonResult = await PostAsync_with_token(uri, payload,token);
     
       console.log('result after api Payload',jsonResult);
       return JSON.stringify(jsonResult ?? '');
     } catch (error) {
       console.error(error);
       throw Error('Failed' + error);
     }
  };

  export const GetMailer = async (query:string): Promise<string> => {
    try {
      ////////debugger
      //const UserID = await AsyncStorage.getItem('UserID');
      let customerId = await getCustomerId();
      var uri = `${BASE_URL}/customeradmin/get_customer_mailer`;
      //var uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
      const token = localStorage.getItem('Token');
      console.log(uri);
      var jsonResult = await GetAsync_with_token(uri, token);
      console.log(jsonResult);
      ////////debugger
      return JSON.stringify(jsonResult ?? '');
    } catch (error) {
      console.error(error);
      throw Error('Failed' + error);
    }
  };
