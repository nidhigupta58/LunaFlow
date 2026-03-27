export interface AIRecommendation {
  diet: { title: string; content: string };
  exercise: { title: string; content: string };
  wellness: { title: string; content: string };
  message: string;
}

export interface UserData {
  name: string;
  email: string;
  weight: string;
  dob: string;
  age: string;
  height: string;
  periodDuration: number;
  cycleLength: number;
  lastPeriodDate: string;
  isRegular: boolean;
  takingPills: boolean;
  sexuallyActive: boolean;
  sleepRoutine: string;
  onboardingComplete: boolean;
  periodHistory?: string[];
}

export interface CalendarTokens {
  access_token?: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  expiry_date?: number;
}

export interface CycleData {
  startDate: string;
  duration: number;
  cycleLength: number;
}
