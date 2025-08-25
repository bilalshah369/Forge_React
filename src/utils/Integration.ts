import {
  GetAsync_with_token,
  PostAsync,
  PostAsync_with_token,
} from '../services/rest_api_service';
//export const BASE_URL = 'https://underbuiltapi.aadhidigital.com';
const BASE_URL = import.meta.env.VITE_BASE_URL;



export const AddADForCustomer  = async (values: object): Promise<string> => {
    try {
      // 
       //const UserID = localStorage.getItem('UserID');
       var uri = `${BASE_URL}/integration/AddADIntegrationSettings`;
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

  export const GetADIntegrationsForCustomer = async (customer_id:string): Promise<string> => {
    try {
      //////////debugger
      //const UserID = localStorage.getItem('UserID');
      var uri = `${BASE_URL}/integration/get_activedirectory_customer_integration?customer_id=${customer_id}`;
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

  export const GetADList = async (): Promise<string> => {
    try {
      //////////debugger
      //const UserID = localStorage.getItem('UserID');
      var uri = `${BASE_URL}/integration/get_activedirectory_integration`;
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


  export const DeleteAD = async (raidId: number): Promise<string> => {
    try {
      const uri = `${BASE_URL}/integration/delete_activedirectory_customer_integration`;
      const token = localStorage.getItem('Token');
      //console.log(uri);
      const payload = JSON.stringify({integration_customer_id: raidId});
      //console.log(payload);
      const jsonResult = await PostAsync_with_token(uri, payload, token);
      //console.log(jsonResult);
      return JSON.stringify(jsonResult ?? '');
    } catch (error) {
      console.error(error);
      throw Error('Failed to delete RAID: ' + error);
    }
  };