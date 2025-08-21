// Type definitions for Intake Upload functionality

export interface IntakeData {
  project_name?: string;
  description?: string;
  project_owner_user?: number;
  project_manager?: number;
  business_stakeholder_user?: number;
  project_owner_dept?: number;
  business_stakeholder_dept?: number;
  impacted_function?: string;
  priority?: number;
  project_size?: number;
  budget_size?: number;
  classification?: number;
  goal?: number;
  program?: number;
  impacted_applications?: number;
  start_date?: string;
  end_date?: string;
  golive_date?: string;
  business_rationale?: string;
  success_criteria?: string;
  assumptions?: string;
  constraints?: string;
  risks?: string;
  dependencies?: string;
  alternatives?: string;
  impact_analysis?: string;
}

export interface MasterData {
  users: User[];
  projectSizes: ProjectSize[];
  priorities: Priority[];
  departments: Department[];
  goals: Goal[];
  programs: Program[];
  imapctedApplications: ImpactedApplication[];
  classifications: Classification[];
  budgetSizes: BudgetSize[];
}

export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  department_id: number;
}

export interface ProjectSize {
  id: number;
  value: string;
}

export interface Priority {
  id: number;
  value: string;
}

export interface Department {
  department_id: number;
  department_name: string;
}

export interface Goal {
  goal_id: number;
  goal_name: string;
}

export interface Program {
  program_id: number;
  program_name: string;
}

export interface ImpactedApplication {
  application_id: number;
  application_name: string;
}

export interface Classification {
  classification_id: number;
  classification_name: string;
}

export interface BudgetSize {
  id: number;
  value: string;
}

// Readable field names for mapping
export type ReadableField =
  | "Project Name"
  | "Description"
  | "Project Owner"
  | "Project Manager"
  | "Business Owner"
  | "Project Owner Department"
  | "Business Owner Department"
  | "Impacted Function"
  | "Priority"
  | "Project Size"
  | "Budget Size"
  | "Classification"
  | "Goal"
  | "Program"
  | "Impacted Applications"
  | "Start Date"
  | "End Date"
  | "Go-live Date"
  | "Business Rationale"
  | "Success Criteria"
  | "Assumptions"
  | "Constraints"
  | "Risks"
  | "Dependencies"
  | "Alternatives"
  | "Impact Analysis";

// Mapping from readable field names to database field names
export const fieldMapping: Record<ReadableField, keyof IntakeData> = {
  "Project Name": "project_name",
  Description: "description",
  "Project Owner": "project_owner_user",
  "Project Manager": "project_manager",
  "Business Owner": "business_stakeholder_user",
  "Project Owner Department": "project_owner_dept",
  "Business Owner Department": "business_stakeholder_dept",
  "Impacted Function": "impacted_function",
  Priority: "priority",
  "Project Size": "project_size",
  "Budget Size": "budget_size",
  Classification: "classification",
  Goal: "goal",
  Program: "program",
  "Impacted Applications": "impacted_applications",
  "Start Date": "start_date",
  "End Date": "end_date",
  "Go-live Date": "golive_date",
  "Business Rationale": "business_rationale",
  "Success Criteria": "success_criteria",
  Assumptions: "assumptions",
  Constraints: "constraints",
  Risks: "risks",
  Dependencies: "dependencies",
  Alternatives: "alternatives",
  "Impact Analysis": "impact_analysis",
};
