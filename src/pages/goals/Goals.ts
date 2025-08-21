/* eslint-disable no-var */
import {
  GetAsync_with_token,
  PostAsync,
  PostAsync_with_token,
} from '../../services/rest_api_service';
//export const BASE_URL = 'https://underbuiltapi.aadhidigital.com';
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const GetGoals = async (PageNo?: number, PageSize?: number, program?:string,is_active?:boolean,start_date?:string,end_date?:string): Promise<string> => {
  try {
    
    var uri = `${BASE_URL}/utils/get_goals`;
    const queryParams = new URLSearchParams();

    if (PageNo)
      {
        queryParams.append('PageNo', PageNo?.toString());
      } 
    if (PageSize)
      {
        queryParams.append('PageSize', PageSize?.toString());
      }
    if (program) 
      {
        queryParams.append('programs', program?.toString());
        
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
    ////////////////////debugger;
    //const isActive = params.isActive ? params.isActive : true;
   
    //const baseUri = `${BASE_URL}/utils/get_goals?is_active=${isActive}`;
    // const uri =
    //   PageNo || PageSize
    //     ? `${baseUri}&${PageNo ? `&PageNo=${PageNo}` : ''}${
    //         PageSize ? `&PageSize=${PageSize}` : ''
    //       }`
    //     : baseUri;

    const token = localStorage.getItem('Token');

    //console.log('Request URL:', uri);

    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log('Response JSON:', jsonResult);

    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error('Error in GetGoals:', error);
    throw new Error(`Failed to fetch goals: ${error}`);
  }
};

export const GetSearchedGoals = async (
  PageNo: number,
  PageSize: number,
  query: string,
): Promise<string> => {
  try {
    const uri = `${BASE_URL}/utils/get_goals?is_active=true&goal_name=${encodeURIComponent(
      query,
    )}&PageNo=${PageNo}&PageSize=${PageSize}`;

    const token = localStorage.getItem('Token'); // Retrieve the token from storage
    //console.log('API Request URI:', uri);

    const jsonResult = await GetAsync_with_token(uri, token); // Make the request with the token
    //console.log('API Response:', jsonResult);

    return JSON.stringify(jsonResult ?? ''); // Return the response as a string
  } catch (error) {
    console.error('Error in GetSearchedProjects:', error);
    throw new Error('Failed to fetch searched projects: ' + error);
  }
};

export const InsertGoal = async (values: object): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/utils/insert_goals`;
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

export const DeleteGoal = async (values: object): Promise<string> => {
  try {
    //
    //const UserID = localStorage.getItem('UserID');
    var uri = `${BASE_URL}/utils/delete_goals`;
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
