export interface UserProfile {
  userId: string;
  name: string;
  age: number;
  city: string;
  education: string;
  maritalStatus: string;
  archetype: string;
  jobTitle: string;
  experience: number;
  salary: number;
  industry: string;
  employmentType: string;
  bankBalance: number;
  monthlySavings: number;
  mutualFunds: number;
  fixedDeposits: number;
  takeHomeIncome: number;
  monthlyExpenses: number;
  assets: string[];
  loans: string[];
  monthlyEmi: number;
  outstandingDebt: number;
  goals: string[];
  primaryGoal: string;
  riskLevel: string;
  riskTolerance: number;
  financialRunway: number;
  dependents: number;
  locationFlexibility: string;
  commitments: string[];
  timelineUrgency: string;
  extraContext: string;
  isPro?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  risk: "Low" | "Medium" | "High";
  viability: number;
  description: string;
  yearlyModifiers: {
    year: number;
    salaryMult: number;
    savingsMult: number;
    notes: string;
  }[];
  stats: {
    fiveYearSalary: number;
    fiveYearSavings: number;
    confidence: string;
  };
  riskFactors: string[];
  winningMoves: string[];
  milestones: {
    year: number;
    type: "career" | "financial" | "savings" | "lifestyle";
    content: string;
  }[];
  history?: Scenario[];
}

export interface ScenarioSettings {
  activeScenarioId: string;
  savingsRate: number;
  salaryGrowth: number;
  investmentReturn: number;
  updatedAt?: any;
}
