/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */
import {
  GetAsync_with_token,
  PostAsync,
  PostAsync_with_token,
} from '../services/rest_api_service';
//export const BASE_URL = 'https://underbuiltapi.aadhidigital.com';
const BASE_URL = import.meta.env.VITE_BASE_URL;


  export const GetDepartments = async (query:string): Promise<string> => {
    try {
      ////////debugger
      //const UserID = localStorage.getItem('UserID');
      var uri = `${BASE_URL}/master/get_department${query === '' ? '' : '?parent_department_id=' + query}`;
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
  

  export const GetDept = async (query:string): Promise<string> => {
    try {
      //const UserID = localStorage.getItem('UserID');
      var uri = `${BASE_URL}/master/get_department`;
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

  export const GetUsers = async (query:string): Promise<string> => {
    try {
      ////////debugger
      //const UserID = localStorage.getItem('UserID');
      var uri = `${BASE_URL}/master/get_users`;
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

  export const DeleteDept  = async (values: any): Promise<string> => {
    try {
      // 
       //const UserID = localStorage.getItem('UserID');
       var uri = `${BASE_URL}/master/delete_department`;
       //var uri = 'https://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
       const token = localStorage.getItem('Token');  
       //console.log(uri);
       var payload = JSON.stringify(values);
       //console.log(payload);
       var jsonResult = await PostAsync_with_token(uri, payload,token);
       
       //console.log(jsonResult);
       return JSON.stringify(jsonResult ?? '');
     } catch (error) {
       console.error(error);
       throw Error('Failed' + error);
     }
  };

  export const InsertDept  = async (values: object): Promise<string> => {
    try {
      // 
       //const UserID = localStorage.getItem('UserID');
       var uri = `${BASE_URL}/master/insert_department`;
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
  
  export const GetPMOUsers = async (query:string): Promise<string> => {
    try {
      ////////debugger
      //const UserID = localStorage.getItem('UserID');
      var uri = `${BASE_URL}/utils/get_pmo_users`;
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





  