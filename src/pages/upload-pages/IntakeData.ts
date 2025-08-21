export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
}

export interface ProjectSize {
  id: number;
  value: string;
}
export interface BudgetSize {
  id: number;
  value: string;
}

export interface Priority {
  id: number;
  value: string;
}

export interface Department {
  department_id: string;
  department_name: string;
}

export interface Goal {
  goal_id: string;
  goal_name: string;
}

export interface Program {
  program_id: string;
  program_name: string;
}

export interface ImapctedApplication {
  application_id: number;
  application_name: string;
}
export interface Classification {
  classification_id: number;
  classification_name: string;
}

export interface MasterData {
  users: User[];
  projectSizes: ProjectSize[];
  priorities: Priority[];
  departments: Department[];
  goals: Goal[];
  programs: Program[];
  imapctedApplications: ImapctedApplication[];
  classifications: Classification[];
  budgetSizes: BudgetSize[];
}

export interface IntakeData {
  project_id: string;
  project_name: string;
  classification: string;
  goal_id: string;
  program_id: string;
  business_stakeholder_user: string;
  business_stakeholder_dept: string;
  project_owner_user: string;
  project_owner_dept: string;
  project_manager_id: string;
  // impacted_stakeholder_dept: ,
  impacted_function: string;
  impacted_applications: string;
  priority: string;
  budget_size: string;
  project_size: string;
  start_date: string;
  end_date: string;
  golive_date: string;
  roi: string;
  business_desc: string;
  scope_definition: string;
  key_assumption: string;
  benefit_roi: string;
  risk: string;
  budget_impact: string;
  actual_budget: string;
}

// Mapping between readable field names and database field names
export const fieldMapping: Record<string, keyof IntakeData> = {
  "Project Name": "project_name",
  Classification: "classification",
  Goal: "goal_id",
  Program: "program_id",
  "Business Owner": "business_stakeholder_user",
  "Business Owner Department": "business_stakeholder_dept",
  "Project Owner": "project_owner_user",
  "Project Owner Department": "project_owner_dept",
  "Project Manager": "project_manager_id",
  "Impacted Function": "impacted_function",
  "Impacted Applications": "impacted_applications",
  Priority: "priority",
  "Budget Size": "budget_size",
  "Project Size": "project_size",
  "Start Date": "start_date",
  "End Date": "end_date",
  "Go-live Date": "golive_date",
  ROI: "roi",
  "Business Description": "business_desc",
  "Scope Definition": "scope_definition",
  "Key Assumption": "key_assumption",
  "Benefit ROI": "benefit_roi",
  Risk: "risk",
  "Budget Impact": "budget_impact",
  "Actual Budget": "actual_budget",
} as const;

export type ReadableField = keyof typeof fieldMapping;
