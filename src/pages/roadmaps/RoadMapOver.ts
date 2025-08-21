/* eslint-disable no-var */
import {
  GetAsync_with_token,
  PostAsync,
  PostAsync_with_token,
} from '../../services/rest_api_service';
const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface Milestone {
  milestone_id: number | null;
  milestone_name: string | null;
  milestone_description: string | null;
  start_date: string | null;
  end_date: string | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
  status: string | null;
  status_color: string | null;
  status_name: string | null;
  priority: number | null;
  short_name: string | null;
  last_status: string | null;
  detail_description: string | null;
  progress_days: number | null;
  total_days: number | null;
  resource_deployment_type: string | null;
  resource_deployment_value: string | null;
  scope_type: string | null;
  scope_value: string | null;
  budget_utilization_type: string | null;
  budget_utilization_value: string | null;
  weak: string | null;
  percent_change: number | null;
  task: string | null;
  upcomming_task: string | null;
  accomplishments: string | null;
}

export interface Project {
  project_id: number | null;
  program_id: number | null;
  goal_id: number | null;
  portfolio_id: number | null;
  department_id: number | null;
  project_manager_id: number | null;
  project_name: string | null;
  project_short_name: string | null;
  description: string | null;
  start_date: string;
  end_date: string;
  golive_date: string | null;
  priority: number | null;
  phase: string | null;
  classification: string;
  initial_budget: string | null;
  initial_budget_unit: string | null;
  project_owner_user: number | null;
  project_owner_dept: number | null;
  business_stakeholder_user: number | null;
  business_stakeholder_dept: number | null;
  impacted_stakeholder_user: number | null;
  impacted_stakeholder_dept: number | null;
  impacted_applications: number | null;
  resource_deployed_percentage: number | null;
  created_at: string | null;
  updated_at: string | null;
  is_active: boolean | null;
  customer_id: number | null;
  project_size: string | null;
  budget_size: string | null;
  business_desc: string | null;
  scope_definition: string | null;
  key_assumption: string | null;
  benefit_roi: string;
  risk: string | null;
  roi: string | null;
  created_by: number | null;
  updated_by: number | null;
  status: number | null;
  status_color: string | null;
  department_color: string | null;
  impacted_function: string | null;
  actual_budget: string | null;
  budget_impact: string | null;
  status_name: string | null;
  current_week_status: string | null;
  current_week_status_color: string | null;
  business_stakeholder_dept_name: string | null;
  impacted_stakeholder_dept_name: string | null;
  impacted_function_name: string | null;
  created_by_name: string | null;
  progress_percentage: string | null;
  progress_status_color: string | null;
  progress_back_color: string | null;
  budget: string | null;
  custom_fields: Array<{field_id: string; field_value: string}> | null;
  milestones: Milestone[] | null;
}

export interface ProjectsResponse {
  status: string;
  message: string;
  data: {
    projects: Project[];
  };
}

export interface Department {
  department_id: number;
  department_name: string;
  parent_department_id: number | null;
  description: string;
  children?: Department[];
  project?: Project[];
}

export const GetProjectsWithDependenciesFilters = async (
  page?: number,
  rowsPerPage?: number,
  filters?: {
    status?: string;
    budget?: string;
    project_manager?: string;
    project_owner_user?: string;
    project_owner_dept?: string;
    goal_id?: string;
    golive_date?: string;
    phase_status?: string;
    searchQuery?: string;
    classification_id?: string;
    budget_min?: string;
    budget_max?: string;
    project_start_date?: string;
    project_end_date?: string;
    priority?: string;
    project_id?: string;
  },
): Promise<string> => {
  ////////////////debugger;
  try {
    let uri = `${BASE_URL}/projectInProgress/get_inProgress_project_with_milestone_roadmap_overview_with_dendency`;

    // Build the query string dynamically from the filters object
    const queryParams = new URLSearchParams();

    if (page) queryParams.append('PageNo', page.toString());
    if (rowsPerPage) queryParams.append('PageSize', rowsPerPage.toString());

    if (filters) {
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.budget) queryParams.append('budget', filters.budget);
      if (filters.project_manager)
        queryParams.append('project_manager', filters.project_manager);
      if (filters.project_owner_user)
        queryParams.append('project_owner_user', filters.project_owner_user);
      if (filters.project_owner_dept)
        queryParams.append('project_owner_dept', filters.project_owner_dept);
      if (filters.goal_id) queryParams.append('goal_id', filters.goal_id);
      if (filters.golive_date)
        queryParams.append('golive_date', filters.golive_date);
      if (filters.phase_status)
        queryParams.append('phase_status', filters.phase_status);
      if (filters.searchQuery)
        queryParams.append('project_name', filters.searchQuery);
      if (filters.classification_id)
        queryParams.append('classification_id', filters.classification_id);
      if (filters.budget_min)
        queryParams.append('budget_min', filters.budget_min);
      if (filters.budget_max)
        queryParams.append('budget_max', filters.budget_max);
      if (filters.project_start_date)
        queryParams.append('project_start_date', filters.project_start_date);
      if (filters.project_end_date)
        queryParams.append('project_end_date', filters.project_end_date);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.project_id)
        queryParams.append('project_id', filters.project_id);
    }

    // Append the query string to the base URL
    uri += `?${queryParams.toString()}`;
    ////////////debugger;
    const token = localStorage.getItem('Token');
    //console.log("Making API call to:", uri);

    // Make the API request with the token
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log("jsonResult:", jsonResult);

    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error('Error in GetProjects API call:', error);
    throw Error('Failed to fetch projects: ' + error);
  }
};
export const GetProjectsWithFilters = async (
  page?: number,
  rowsPerPage?: number,
  filters?: {
    status?: string;
    budget?: string;
    project_manager?: string;
    project_owner_user?: string;
    project_owner_dept?: string;
    goal_id?: string;
    golive_date?: string;
    phase_status?: string;
    searchQuery?: string;
    classification_id?: string;
    budget_min?: string;
    budget_max?: string;
    project_start_date?: string;
    project_end_date?: string;
    priority?: string;
    project_id?: string;
  },
): Promise<string> => {
  ////////////////debugger;
  try {
    let uri = `${BASE_URL}/projectInProgress/get_inProgress_project_with_milestone_roadmap_overview`;

    // Build the query string dynamically from the filters object
    const queryParams = new URLSearchParams();

    if (page) queryParams.append('PageNo', page.toString());
    if (rowsPerPage) queryParams.append('PageSize', rowsPerPage.toString());

    if (filters) {
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.budget) queryParams.append('budget', filters.budget);
      if (filters.project_manager)
        queryParams.append('project_manager', filters.project_manager);
      if (filters.project_owner_user)
        queryParams.append('project_owner_user', filters.project_owner_user);
      if (filters.project_owner_dept)
        queryParams.append('project_owner_dept', filters.project_owner_dept);
      if (filters.goal_id) queryParams.append('goal_id', filters.goal_id);
      if (filters.golive_date)
        queryParams.append('golive_date', filters.golive_date);
      if (filters.phase_status)
        queryParams.append('phase_status', filters.phase_status);
      if (filters.searchQuery)
        queryParams.append('project_name', filters.searchQuery);
      if (filters.classification_id)
        queryParams.append('classification_id', filters.classification_id);
      if (filters.budget_min)
        queryParams.append('budget_min', filters.budget_min);
      if (filters.budget_max)
        queryParams.append('budget_max', filters.budget_max);
      if (filters.project_start_date)
        queryParams.append('project_start_date', filters.project_start_date);
      if (filters.project_end_date)
        queryParams.append('project_end_date', filters.project_end_date);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.project_id)
        queryParams.append('project_id', filters.project_id);
    }

    // Append the query string to the base URL
    uri += `?${queryParams.toString()}`;
    ////////////debugger;
    const token = localStorage.getItem('Token');
    //console.log("Making API call to:", uri);

    // Make the API request with the token
    const jsonResult = await GetAsync_with_token(uri, token);
    //console.log("jsonResult:", jsonResult);

    return JSON.stringify(jsonResult ?? '');
  } catch (error) {
    console.error('Error in GetProjects API call:', error);
    throw Error('Failed to fetch projects: ' + error);
  }
};

export const GetDept = async (filters?: {
  department_id?: string;
  searchQuery?: string;
}): Promise<string> => {
  try {
    const queryParams = new URLSearchParams();
    var uri = `${BASE_URL}/master/get_department`;

    if (filters) {
      if (filters.department_id)
        queryParams.append('department_id', filters.department_id);
      if (filters.searchQuery)
        queryParams.append('department_name', filters.searchQuery);
    }

    uri += `?${queryParams.toString()}`;
    //const UserID = localStorage.getItem('UserID');
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
