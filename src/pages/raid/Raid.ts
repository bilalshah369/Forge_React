/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  GetAsync_with_token,
  PostAsync,
  PostAsync_with_token,
} from '../../services/rest_api_service';
//export const BASE_URL = 'https://underbuiltapi.aadhidigital.com';
const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface RaidData {
  raid_id: number;
  project_id: number;
  type: string;
  title: string;
  driver: string;
  description: string;
  impact: string;
  status: string;
  next_status: string;
  priority: any;
  due_date: string;
  raid_owner: number;
  is_active: boolean;
}

export const GetRaids = async (
  projectId: number,
  raidId?: number,
  PageNo?: number,
  PageSize?: number,
  startDate?: string,
  endDate?: string,
  priority?: string,
  status?: string,
  dept?: string,
): Promise<string> => {
  try {
    ////////debugger;
    let baseUri = `${BASE_URL}/approvedProjects/get_raid?project_id=${
      projectId === 0 ? '' : projectId
    }&priority=${priority === undefined ? '' : priority}`;

    if (PageNo) baseUri += `&PageNo=${PageNo}`;
    if (PageSize) baseUri += `&PageSize=${PageSize}`;
    if (raidId) baseUri += `&raid_id=${raidId}`;
    if (status) baseUri += `&status=${encodeURIComponent(status)}`;
    if (dept)
      baseUri += `&project_owner_dept_hierarchy=${encodeURIComponent(dept)}`;
    // ✅ Use correct query parameter names for the API
    if (startDate)
      baseUri += `&project_start_date=${encodeURIComponent(startDate)}`;
    if (endDate) baseUri += `&project_end_date=${encodeURIComponent(endDate)}`;

    const token = localStorage.getItem('Token');
    //////////debugger;
    const jsonResult = await GetAsync_with_token(baseUri, token);

    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed to get RAIDs: ' + error);
  }
};

export const GetRaidTable = async (
  projectId: number,
  raidId?: number,
  PageNo?: number,
  PageSize?: number,
  startDate?: string,
  endDate?: string,
  priority?: string,
  status?: string,
  dept?: string,
) => {
  try {
    ////////debugger;
    let baseUri = `${BASE_URL}/chartsApis/get_raid_table?project_id=${
      projectId === 0 ? '' : projectId
    }&priority=${priority === undefined ? '' : priority}`;

    if (PageNo) baseUri += `&PageNo=${PageNo}`;
    if (PageSize) baseUri += `&PageSize=${PageSize}`;
    if (raidId) baseUri += `&raid_id=${raidId}`;
    if (status) baseUri += `&status=${encodeURIComponent(status)}`;
    if (dept)
      baseUri += `&project_owner_dept_hierarchy=${encodeURIComponent(dept)}`;
    // ✅ Use correct query parameter names for the API
    if (startDate)
      baseUri += `&project_start_date=${encodeURIComponent(startDate)}`;
    if (endDate) baseUri += `&project_end_date=${encodeURIComponent(endDate)}`;

    const token = localStorage.getItem('Token');
    const jsonResult = await GetAsync_with_token(baseUri, token);

    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed to get RAIDs: ' + error);
  }
};

export const InsertRaid = async (values: any): Promise<string> => {
  try {
    //debugger;
    const uri = `${BASE_URL}/approvedProjects/insert_raid`;
    const token = localStorage.getItem('Token');
    //console.log(uri);
    const payload = JSON.stringify(values);
    //console.log(payload);
    const jsonResult = await PostAsync_with_token(uri, payload, token);
    //console.log(jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed to insert RAID: ' + error);
  }
};

export const DeleteRaid = async (raidId: number): Promise<string> => {
  try {
    const uri = `${BASE_URL}/approvedProjects/delete_raid`;
    const token = localStorage.getItem('Token');
    //console.log(uri);
    const payload = JSON.stringify({raid_id: raidId});
    //console.log(payload);
    const jsonResult = await PostAsync_with_token(uri, payload, token);
    //console.log(jsonResult);
    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error(error);
    throw Error('Failed to delete RAID: ' + error);
  }
};
export const fetchPriorities = async (): Promise<string> => {
  try {
    const uri = `${BASE_URL}/utils/get_priorities`;
    const token = localStorage.getItem('Token');
    const jsonResult = await GetAsync_with_token(uri, token);
    return JSON.stringify(jsonResult ?? '');
    // Remove JSON.parse() because jsonResult is already an object
    // return jsonResult.data.map((item: any) => ({
    //   id: item.id,
    //   value: item.value,
    //   is_active: item.is_active,
    // }));
  } catch (error) {
    console.error('Error fetching priorities:', error);
    throw new Error('Failed to fetch priorities: ');
  }
};
