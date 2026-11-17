export interface TaskItem {
  id: string;
  title: string;
  category: string;
  completed: boolean;
}

export interface WellbeingRoutine {
  id: string;
  name: string;
  icon: string;
  hint: string;
  done: boolean;
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  date: string;
  completed: boolean;
}

export interface JournalEntry {
  id: string;
  date: string;
  mood: string;
  content: string;
}

export interface DashboardData {
  tasks: TaskItem[];
  routines: WellbeingRoutine[];
  waterGlasses: number;
  roadmap: RoadmapStep[];
  journalEntries: JournalEntry[];
}

export interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  url: string;
  description: string;
  postedAt: string;
}
