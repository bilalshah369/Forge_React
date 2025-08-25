import {
  GetAsync_with_token,
  PostAsync,
  PostAsync_with_token,
} from '../services/rest_api_service';
//export const BASE_URL = 'https://underbuiltapi.aadhidigital.com';
const BASE_URL = import.meta.env.VITE_BASE_URL;


export const GetIntakeBudget = async (query:string): Promise<string> => {
    try {
      //////////debugger
      //const UserID = localStorage.getItem('UserID');
      var uri = `${BASE_URL}/utils/get_budget_details?project_id=${query}`;
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

  export const InsertActualBudget  = async (values: Object): Promise<string> => {
    try {
      // 
       //const UserID = localStorage.getItem('UserID');
       var uri = `${BASE_URL}/approvedProjects/update_budget_details_monthwise`;
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

  export const InsertActualBudgetMultiple  = async (values: Object): Promise<string> => {
    try {
      // 
       //const UserID = localStorage.getItem('UserID');
       var uri = `${BASE_URL}/approvedProjects/update_budget_details_monthwise_multiple`;
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


  
export const GetBudgetArray = async (query:string): Promise<string> => {
  try {
    //////////debugger
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/approvedProjects/get_budget_details_combined?project_id=${query}`;
    //var uri = 'http://qms.digital.logicsoft.online:8081/gateway/dilip/upload-samplecollectionimages';
    const token = localStorage.getItem('Token');
    //console.log(uri);
    var jsonResult = await GetAsync_with_token(uri, token);
    //console.log(jsonResult);
    //////////debugger
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
     
    
    //throw Error('Failed' + error);
    console.error(error);
    return "";
  }
};