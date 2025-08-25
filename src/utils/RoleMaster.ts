/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */
import {
  GetAsync_with_token,
  PostAsync,
  PostAsync_with_token,
} from '../services/rest_api_service';
import { decodeBase64 } from './securedata';
//export const BASE_URL = 'https://underbuiltapi.aadhidigital.com';
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const AddAndEditRole = async (values: object): Promise<string> => {
  //console.log(values,"ap vay")

  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/master/insert_roles`;
    //var uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    //console.log(uri);
    var payload = JSON.stringify(values);
    //console.log(payload);
    var jsonResult = await PostAsync_with_token(uri, payload, token);
    //
    //
    //console.log(jsonResult,"api");
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};

export const DeleteRole = async (roleId: number): Promise<string> => {
  //console.log(`Deleting role with ID: ${roleId}`);
  try {
    const uri = `${BASE_URL}/master/delete_roles`;
    const token = localStorage.getItem('Token');

    // Create payload with role_id
    const payload = JSON.stringify({role_id: roleId});
    //console.log(`Payload: ${payload}`);

    // Make the API call to delete the role using the token for authorization
    const jsonResult = await PostAsync_with_token(uri, payload, token);
    //console.log('Delete API response:', jsonResult);

    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error('Error in Delete API:', error);
    throw new Error('Failed to delete role: ' + error);
  }
};

export const GetRoles = async (query: string): Promise<string> => {
  try {
    //////////debugger
    //const UserID = localStorage.getItem('UserID');
    //let customerId = await getCustomerId();
    var uri = `${BASE_URL}/master/get_roles`;
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
export const getCustomerId = async () => {
  try {
    const localcustomerID =  localStorage.getItem('Customer_ID');
    const decodedCustomerID = decodeBase64(localcustomerID || '');
    //console.log('Your Customer ID is ', decodedCustomerID);
    return decodedCustomerID;  // Assuming setCustomerID is passed to the function
  } catch (err) {
    //console.log('Error fetching the customerID', err);
  }
};
export const GetRolesByPage = async (queryParams: {
  PageNo: number;
  PageSize: number;
  [key: string]: any;
}): Promise<string> => {
  try {
    const token = localStorage.getItem('Token');
    const customerId = await getCustomerId();

    var uri = `${BASE_URL}/master/get_roles?customer_id=${customerId}`;

    //Append pagination parameters
    const queryString = Object.keys(queryParams)
      .map(
        key =>
          `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`,
      )
      .join('&');

    uri = `${uri}&${queryString}`;

    //Make the API call
    const jsonResult = await GetAsync_with_token(uri, token);

    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error('Error in GetRolesByPage:', error);
    throw new Error('Failed to get roles: ' + error);
  }
};

export const GetModulesByRole = async (role_id: number): Promise<string> => {
  try {
    var uri = `${BASE_URL}/master/get_role_vs_modules?role_id=${role_id}`;
    const token = localStorage.getItem('Token');
    var jsonResult = await GetAsync_with_token(uri, token);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed' + error);
  }
};
