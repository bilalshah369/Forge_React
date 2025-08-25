import {
  GetAsync_with_token,
  PostAsync,
  PostAsync_with_token,
} from '../../../services/rest_api_service';
//export const BASE_URL = 'https://underbuiltapi.aadhidigital.com';
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const GetDept = async (query:string): Promise<string> => {
    try {
      //////////debugger
      //const UserID = localStorage.getItem('UserID');
      var uri = `${BASE_URL}/master/get_department`;
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



  export const GetDesignationChart = async (query:string): Promise<string> => {
    try {
      //////////debugger
      //const UserID = localStorage.getItem('UserID');
      var uri = `${BASE_URL}/chartsApis/org_chart`;
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


  