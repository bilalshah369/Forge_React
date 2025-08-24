import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarDays,
  Users,
  DollarSign,
  Target,
  Database,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "react-router-dom";
import ProjectView from "../projects/ProjectView";
import TeamMembers from "./TeamMembers";
import MilestoneNew from "./MilestoneNew";
import CustomData from "./CustomData";
import Summary from "./Summary";
import ProjectViewChangeRequest from "../projects/ProjectViewChangeRequest";
import TeamMembersChangeRequest from "./TeamMembersChangeRequest";
import MilestoneNewChangeRequest from "./MilestoneNewChangeRequest";

// Form schemas for different sections
const intakeSummarySchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  department: z.string().min(1, "Department is required"),
  requestor: z.string().min(1, "Requestor is required"),
  urgency: z.string().min(1, "Urgency level is required"),
});

type IntakeSummary = z.infer<typeof intakeSummarySchema>;

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
}

interface BudgetItem {
  id: string;
  category: string;
  description: string;
  amount: number;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "in-progress" | "completed";
}

const tabs = [
  { id: "intake-summary", label: "Intake Summary", icon: Target },
  { id: "team-members", label: "Team Members", icon: Users },

  { id: "milestones", label: "Milestones", icon: CalendarDays },
  { id: "preview-submit", label: "Preview & Submit", icon: Eye },
];

export default function ChangeRequestWizard({_isApproval=false}) {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const isEditable = searchParams.get("isEditable") === "true";
  const status = parseInt(searchParams.get("status") ?? "");
  const [activeTab, setActiveTab] = useState("intake-summary");

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "John Smith",
      role: "Project Manager",
      department: "IT",
      email: "john.smith@company.com",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      role: "Training Specialist",
      department: "HR",
      email: "sarah.johnson@company.com",
    },
  ]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    {
      id: "1",
      category: "Training Materials",
      description: "Online courses and resources",
      amount: 5000,
    },
    {
      id: "2",
      category: "Instructor Fees",
      description: "External trainer costs",
      amount: 12000,
    },
    {
      id: "3",
      category: "Venue Costs",
      description: "Training facility rental",
      amount: 3000,
    },
  ]);
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: "1",
      title: "Needs Assessment",
      description: "Complete initial assessment",
      dueDate: "2024-01-15",
      status: "completed",
    },
    {
      id: "2",
      title: "Training Design",
      description: "Develop training curriculum",
      dueDate: "2024-02-01",
      status: "in-progress",
    },
    {
      id: "3",
      title: "Implementation",
      description: "Roll out training program",
      dueDate: "2024-03-15",
      status: "pending",
    },
  ]);

  const intakeForm = useForm<IntakeSummary>({
    resolver: zodResolver(intakeSummarySchema),
    defaultValues: {
      projectName: "Assessment of Training and Development Needs",
      description: "",
      department: "",
      requestor: "",
      urgency: "",
    },
  });

  const handleSubmit = () => {
    console.log("Assessment data submitted");
    // Handle final submission
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className=" mx-auto">
        {/* Header */}
        {/* <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Project Name - Assessment of Training and Development Needs
          </h1>
        </div> */}

        {/* Main Content */}
        <Card className="shadow-lg border-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="border-b border-border px-6">
              <TabsList className="h-auto p-0 bg-transparent">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            <div className="p-6">
              {/* Intake Summary Tab */}
              <TabsContent value="intake-summary" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      Project Intake Change Summary
                    </h2>
                    <ProjectViewChangeRequest
                      changeRequest={_isApproval?false:true}
                      showApproval={_isApproval?true:false}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Team Members Tab */}
              <TabsContent value="team-members" className="mt-0">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    {/* <h2 className="text-xl font-semibold">Team Members</h2> */}
                    {/* <Button>Add Team Member</Button> */}
                  </div>
                  <TeamMembersChangeRequest changeRequest={_isApproval?false:true}
                      showApproval={_isApproval?true:false}/>
                </div>
              </TabsContent>

              {/* Budget Forecast Tab */}
              <TabsContent value="budget-forecast" className="mt-0">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Budget Forecast</h2>
                    <Button>Add Budget Item</Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {budgetItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.category}
                          </TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-right">
                            ${item.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex justify-end">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Total Budget
                      </p>
                      <p className="text-2xl font-bold">
                        $
                        {budgetItems
                          .reduce((sum, item) => sum + item.amount, 0)
                          .toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Milestones Tab */}
              <TabsContent value="milestones" className="mt-0">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <MilestoneNewChangeRequest changeRequest={_isApproval?false:true}
                      showApproval={_isApproval?true:false}/>
                  </div>
                </div>
              </TabsContent>

              {/* Custom Data Tab */}
              <TabsContent value="custom-data" className="mt-0">
                <div className="space-y-6">
                  <CustomData />
                </div>
              </TabsContent>

              {/* Preview & Submit Tab */}
              <TabsContent value="preview-submit" className="mt-0">
                <div className="space-y-6">
                  <Summary changeRequest={_isApproval?false:true}
                      showApproval={_isApproval?true:false} />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
