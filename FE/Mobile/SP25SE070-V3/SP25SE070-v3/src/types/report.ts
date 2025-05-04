export interface ReportResponse {
  reportID: number;
  reportCode: string;
  description: string;
  imageURL: string;
  avatarOfQuestioner: string;
  avatarOfAnswer: string;
  createdDate: string;
  isTrainned: boolean;
  questionerID: number;
  questionerName: string;
  questionOfUser: string;
  answerFromExpert?: string;
  answererName: string;
  status?: "Pending" | "Answered";
}

export interface TodayTaskResponse {
  workLogId: number;
  workLogName: string;
  status: string;
  time: string;
}

export interface EmployeeProductivityResponse {
  tasksCompleted: number;
  hoursWorked: number;
  skillScore: number;
  aiReportsSubmitted: number;
  tasksPendingToday: number;
  chartData: ChartData;
}

export interface ChartData {
  tasks: Task[];
}

export interface Task {
  label: string;
  count: number;
}
