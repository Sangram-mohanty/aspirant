import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DashboardData, JobOpportunity, JournalEntry, RoadmapStep, TaskItem, WellbeingRoutine } from './dashboard.models';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  readonly navigation: { id: string; label: string; icon: string }[] = [
    { id: 'home', label: 'Dashboard', icon: '⌂' },
    { id: 'tasks', label: 'Daily focus', icon: '☷' },
    { id: 'roadmap', label: 'My roadmap', icon: '↗' },
    { id: 'journal', label: 'Private journal', icon: '▤' },
    { id: 'wellbeing', label: 'Wellbeing', icon: '✳' },
    { id: 'interview', label: 'Interview prep', icon: '◉' },
    { id: 'opportunities', label: 'Opportunities', icon: '⌕' },
    { id: 'motivation', label: 'A little hope', icon: '♡' }
  ];

  readonly questions: InterviewQuestion[] = [
    { id: 'q1', number: '01', category: 'Behavioral', question: 'Tell me about a project you are proud of.', guide: 'Choose a project where your contribution is clear. Explain the challenge, the decisions you made, the result, and what you would improve next time.', open: false },
    { id: 'q2', number: '02', category: 'Angular', question: 'How do you decide how to structure an Angular application?', guide: 'Talk about feature boundaries, shared UI and data access, standalone components, routing, and how the structure can grow without making every part depend on every other part.', open: false },
    { id: 'q3', number: '03', category: 'JavaScript', question: 'What is the difference between a Promise and an Observable?', guide: 'Compare one eventual value with a stream of values. Mention cancellation, composition, and when each abstraction is useful in an application.', open: false },
    { id: 'q4', number: '04', category: 'Behavioral', question: 'Tell me about a time you had to work through a difficult bug.', guide: 'Describe how you made the issue reproducible, narrowed down the cause, communicated impact, verified the fix, and captured what you learned.', open: false },
    { id: 'q5', number: '05', category: 'Angular', question: 'How do you keep a larger Angular application maintainable?', guide: 'Consider clear component responsibilities, typed APIs, appropriate state ownership, accessible UI, automated tests, and reviewing performance as the application grows.', open: false },
    { id: 'q6', number: '06', category: 'System design', question: 'How would you design a dashboard that updates with live data?', guide: 'Clarify freshness and scale first. Then discuss API shape, polling versus server push, loading and error states, client-side state, and how you would test failure and reconnection.', open: false }
  ];
  readonly quotes = [
    'You do not have to see the whole staircase. Just take the first step.',
    'Your pace is allowed to be different. Keep moving in the direction that matters.',
    'Rest, regroup, and try again. A pause is not the same as giving up.',
    'A rejection is one decision, not a definition of your potential.'
  ];
  readonly waterDrops = Array.from({ length: 8 });

  dashboard: DashboardData = { tasks: [], routines: [], waterGlasses: 0, roadmap: [], journalEntries: [] };
  jobs: JobOpportunity[] = [];
  activeSection = 'home';
  isLoading = true;
  errorMessage = '';
  notice = '';
  newTaskTitle = '';
  newTaskCategory = 'Career';
  newRoadmapTitle = '';
  newRoadmapDate = '';
  journalContent = '';
  journalMood = 'Hopeful';
  questionFilter = 'All';
  showJobForm = false;
  quoteIndex = 0;
  jobDraft = { title: '', company: '', location: '', type: 'Full-time', url: '', description: '' };
  private noticeTimer?: ReturnType<typeof setTimeout>;

  constructor(private readonly dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadData();
  }

  get todayLabel(): string {
    return new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date());
  }

  get todayDay(): string {
    return new Intl.DateTimeFormat('en', { weekday: 'long' }).format(new Date()).toUpperCase();
  }

  get todayShortDate(): string {
    return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric' }).format(new Date()).toUpperCase();
  }

  get pageTitle(): string {
    return this.navigation.find(item => item.id === this.activeSection)?.label ?? 'Dashboard';
  }

  get completedTasks(): number {
    return this.dashboard.tasks.filter(task => task.completed).length;
  }

  get pendingTasks(): number {
    return this.dashboard.tasks.length - this.completedTasks;
  }

  get completedRoutine(): number {
    return this.dashboard.routines.filter(routine => routine.done).length;
  }

  get completedRoadmap(): number {
    return this.dashboard.roadmap.filter(step => step.completed).length;
  }

  get taskProgress(): number {
    return this.percentage(this.completedTasks, this.dashboard.tasks.length);
  }

  get routineProgress(): number {
    return this.percentage(this.completedRoutine, this.dashboard.routines.length);
  }

  get waterProgress(): number {
    return this.percentage(this.dashboard.waterGlasses, 8);
  }

  get quoteOfTheDay(): string {
    return this.quotes[this.quoteIndex];
  }

  get questionCategories(): string[] {
    return [...new Set(this.questions.map(question => question.category))];
  }

  get filteredQuestions(): InterviewQuestion[] {
    return this.questionFilter === 'All'
      ? this.questions
      : this.questions.filter(question => question.category === this.questionFilter);
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.dashboardService.getDashboard().subscribe({
      next: dashboard => {
        this.dashboard = dashboard;
        this.isLoading = false;
        this.loadJobs();
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'We could not reach your workspace. Check that the Aspirant API is running, then try again.';
      }
    });
  }

  goTo(section: string): void {
    if (this.navigation.some(item => item.id === section)) {
      this.activeSection = section;
    }
  }

  addTask(): void {
    const title = this.newTaskTitle.trim();
    if (!title) return;
    this.dashboard.tasks = [{ id: this.createId(), title, category: this.newTaskCategory, completed: false }, ...this.dashboard.tasks];
    this.newTaskTitle = '';
    this.saveDashboard('Task added');
  }

  toggleTask(task: TaskItem): void {
    task.completed = !task.completed;
    this.saveDashboard('Your focus is updated');
  }

  removeTask(id: string): void {
    this.dashboard.tasks = this.dashboard.tasks.filter(task => task.id !== id);
    this.saveDashboard('Task removed');
  }

  clearCompleted(): void {
    this.dashboard.tasks = this.dashboard.tasks.filter(task => !task.completed);
    this.saveDashboard('Completed tasks cleared');
  }

  toggleRoutine(routine: WellbeingRoutine): void {
    routine.done = !routine.done;
    this.saveDashboard('Routine updated');
  }

  changeWater(amount: number): void {
    this.dashboard.waterGlasses = Math.max(0, Math.min(8, this.dashboard.waterGlasses + amount));
    this.saveDashboard('Water check-in saved');
  }

  addRoadmapStep(): void {
    const title = this.newRoadmapTitle.trim();
    if (!title) return;
    this.dashboard.roadmap.push({
      id: this.createId(),
      title,
      description: 'A milestone you chose for your next chapter.',
      date: this.newRoadmapDate.trim(),
      completed: false
    });
    this.newRoadmapTitle = '';
    this.newRoadmapDate = '';
    this.saveDashboard('Roadmap step added');
  }

  toggleRoadmap(step: RoadmapStep): void {
    step.completed = !step.completed;
    this.saveDashboard('Roadmap updated');
  }

  saveJournalEntry(): void {
    const content = this.journalContent.trim();
    if (!content) return;
    const entry: JournalEntry = {
      id: this.createId(),
      date: new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date()),
      mood: this.journalMood,
      content
    };
    this.dashboard.journalEntries = [entry, ...this.dashboard.journalEntries];
    this.journalContent = '';
    this.saveDashboard('Your reflection is saved');
  }

  nextQuote(): void {
    this.quoteIndex = (this.quoteIndex + 1) % this.quotes.length;
  }

  openMotivationVideo(): void {
    window.open('https://www.youtube.com/results?search_query=never+give+up+motivational+video', '_blank', 'noopener,noreferrer');
  }

  submitJob(): void {
    const payload = {
      ...this.jobDraft,
      title: this.jobDraft.title.trim(),
      company: this.jobDraft.company.trim(),
      location: this.jobDraft.location.trim(),
      type: this.jobDraft.type.trim() || 'Opportunity',
      description: this.jobDraft.description.trim()
    };
    if (!payload.title || !payload.company || !payload.location || !payload.url) return;
    this.dashboardService.createJob(payload).subscribe({
      next: job => {
        this.jobs = [job, ...this.jobs];
        this.jobDraft = { title: '', company: '', location: '', type: 'Full-time', url: '', description: '' };
        this.showJobForm = false;
        this.showNotice('Opportunity shared');
      },
      error: () => this.showError('We could not publish this opportunity. Please try again.')
    });
  }

  trackById(_index: number, item: { id: string }): string {
    return item.id;
  }

  private loadJobs(): void {
    this.dashboardService.getJobs().subscribe({
      next: jobs => this.jobs = jobs,
      error: () => this.showError('Your workspace loaded, but opportunities are unavailable right now.')
    });
  }

  private saveDashboard(message: string): void {
    this.dashboardService.saveDashboard(this.dashboard).subscribe({
      next: () => this.showNotice(message),
      error: () => this.showError('Your change could not be saved. Please try again.')
    });
  }

  private percentage(value: number, total: number): number {
    return total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  }

  private createId(): string {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  private showNotice(message: string): void {
    this.errorMessage = '';
    this.notice = message;
    if (this.noticeTimer) clearTimeout(this.noticeTimer);
    this.noticeTimer = setTimeout(() => this.notice = '', 2400);
  }

  private showError(message: string): void {
    this.notice = '';
    this.errorMessage = message;
  }
}

interface InterviewQuestion {
  id: string;
  number: string;
  category: 'Behavioral' | 'Angular' | 'JavaScript' | 'System design';
  question: string;
  guide: string;
  open: boolean;
}
