/* eslint-disable no-var */
import {
  GetAsync_with_token,
  PostAsync,
  PostAsync_with_token,
} from '../../services/rest_api_service';
//export const BASE_URL = 'https://underbuiltapi.aadhidigital.com';
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const GetPrograms = async (PageNo?: number, PageSize?: number, goal?:string,is_active?:boolean,start_date?:string,end_date?:string): Promise<string> => {
  try {

var uri = `${BASE_URL}/utils/get_programs`;
    const queryParams = new URLSearchParams();

    if (PageNo)
      {
        queryParams.append('PageNo', PageNo?.toString());
      } 
    if (PageSize)
      {
        queryParams.append('PageSize', PageSize?.toString());
      }
    if (goal) 
      {
        queryParams.append('goal_ids', goal?.toString());
        
      }
      if (start_date) 
        {
          queryParams.append('start_date', start_date?.toString());
          
        }
        if (end_date) 
          {
            queryParams.append('end_date', end_date?.toString());
            
          }
      queryParams.append('is_active',is_active ? is_active?.toString() : 'true');
    // if (project_end_date)
    //   {
    //     queryParams.append('project_end_date', project_end_date?.toString());
        
    //   }
    

    // Append the query string to the base URL
    uri += `?${queryParams.toString()}`;

    // const { PageNo, PageSize } = params;
    // const uri = `${BASE_URL}/utils/get_programs?is_active=true&PageNo=${PageNo}&PageSize=${PageSize}`; // Add pagination params to the URL
    const token = localStorage.getItem('Token'); // Retrieve token from storage
    //console.log('Request URL:', uri);

    const jsonResult = await GetAsync_with_token(uri, token); // Fetch data with token
    //console.log('Response JSON:', jsonResult);

    return JSON.stringify(jsonResult ?? ''); // Return the result as a string
  } catch (error) {
    console.error('Error in GetPrograms:', error);
    throw new Error(`Failed to fetch programs: ${error}`);
  }
};


  export const GetProgramsByGoalId = async (goalId:string, isActive:string): Promise<string> => {
    try {
      ////////debugger
      //const UserID = localStorage.getItem('UserID');
      // if(!isActive){
      //   isActive = '';
      // }
      var uri = `${BASE_URL}/utils/get_programs?goal_id=${goalId}&is_active=${isActive}`;
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



  export const InsertProgram  = async (values: object): Promise<string> => {
    try {
      // 
       //const UserID = localStorage.getItem('UserID');
       var uri = `${BASE_URL}/utils/insert_program`;
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


  export const DeleteProgram  = async (values: object): Promise<string> => {
    try {
      // 
       //const UserID = localStorage.getItem('UserID');
       var uri = `${BASE_URL}/utils/delete_program`;
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