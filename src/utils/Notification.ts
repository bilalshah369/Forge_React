/* eslint-disable no-var */

import {
  GetAsync_with_token,
  PostAsync,
  PostAsync_with_token,
} from '../services/rest_api_service';
//export const BASE_URL = 'https://underbuiltapi.aadhidigital.com';
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const GetNotifications = async (params?: { PageNo?: number; PageSize?: number; NotificationId?: string }): Promise<string> => {
  try {
    // Extract PageNo and PageSize from params, defaulting to undefined if not provided
    const PageNo = params?.PageNo;
    const PageSize = params?.PageSize;
    const NotificationId = params?.NotificationId;

    // Base URL for the API
    const baseUri = `${BASE_URL}/alerts/get_notification_master`;

    // Append pagination parameters only if they are provided
    const uri = `${baseUri}${NotificationId ? `?notification_id=${NotificationId}` : ''}${PageNo ? `&PageNo=${PageNo}` : ''}${PageSize ? `&PageSize=${PageSize}` : ''}`;

    // Retrieve token from storage
    const token = localStorage.getItem('Token');
    //console.log('Request URL:', uri);

    // Fetch data with token
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log('Response JSON:', jsonResult);

    // Return the result as a string
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error('Error in Getotifications:', error);
    throw new Error(`Failed to fetch Notifications: ${error}`);
  }
};
export const AddNotification = async (values: object): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/alerts/insert_update_notification`;
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

export const GetUserNotifications = async (params?: { PageNo?: number; PageSize?: number; NotificationId?: string }): Promise<string> => {
  try {
    // Extract PageNo and PageSize from params, defaulting to undefined if not provided
    const PageNo = params?.PageNo;
    const PageSize = params?.PageSize;
    const NotificationId = params?.NotificationId;

    // Base URL for the API
    const baseUri = `${BASE_URL}/alerts/get_notifications`;
//debugger
    // Append pagination parameters only if they are provided
    const uri = `${baseUri}?notification_id=${NotificationId}${PageNo ? `&PageNo=${PageNo}` : ''}${PageSize ? `&PageSize=${PageSize}` : ''}`;

    // Retrieve token from storage
    const token = localStorage.getItem('Token');
    //console.log('Request URL:', uri);

    // Fetch data with token
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log('Response JSON:', jsonResult);

    // Return the result as a string
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error('Error in Getotifications:', error);
    throw new Error(`Failed to fetch Notifications: ${error}`);
  }
};

export const MarkNotificationAsRead = async (values: object): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/alerts/mark_notifications_viewed`;
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

export const GetCustomerNotifications = async (params?: { PageNo?: number; PageSize?: number; NotificationId?: string }): Promise<string> => {
  try {
    // Extract PageNo and PageSize from params, defaulting to undefined if not provided
    const PageNo = params?.PageNo;
    const PageSize = params?.PageSize;
    const NotificationId = params?.NotificationId;

    // Base URL for the API
    const baseUri = `${BASE_URL}/alerts/get_customer_notifications`;

    // Append pagination parameters only if they are provided
    const uri = `${baseUri}${NotificationId ? `&notification_id=${NotificationId}` : ''}${PageNo ? `&PageNo=${PageNo}` : ''}${PageSize ? `&PageSize=${PageSize}` : ''}`;

    // Retrieve token from storage
    const token = localStorage.getItem('Token');
    //console.log('Request URL:', uri);

    // Fetch data with token
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log('Response JSON:', jsonResult);

    // Return the result as a string
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error('Error in Getotifications:', error);
    throw new Error(`Failed to fetch Notifications: ${error}`);
  }
};

export const UpadteCustomerNotification = async (values: object): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/alerts/update_customer_notification`;
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

export const UpadteProjectNotification = async (values: object): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/alerts/update_project_notification`;
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
export const GetAlertRecipients = async (query?: string ): Promise<string> => {
  try {
    // Extract PageNo and PageSize from params, defaulting to undefined if not provided

    // Base URL for the API
    const baseUri = `${BASE_URL}/alerts/get_project_notifications?project_id=${query}`;

    // Retrieve token from storage
    const token = localStorage.getItem('Token');
    //console.log('Request URL:', uri);

    // Fetch data with token
    const jsonResult = await GetAsync_with_token(baseUri, token);
    //console.log('Response JSON:', jsonResult);

    // Return the result as a string
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error('Error in Getotifications:', error);
    throw new Error(`Failed to fetch Notifications: ${error}`);
  }
};
