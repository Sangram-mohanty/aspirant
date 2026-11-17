import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { defer, Observable, of } from 'rxjs';
import { DashboardData, JobOpportunity } from './dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly apiUrl = '/api';
  private readonly storageKey = 'aspirant.dashboard.v1';

  constructor(private readonly http: HttpClient) {}

  getDashboard(): Observable<DashboardData> {
    return defer(() => {
      const saved = localStorage.getItem(this.storageKey);
      return of(saved ? JSON.parse(saved) as DashboardData : this.initialDashboard());
    });
  }

  saveDashboard(dashboard: DashboardData): Observable<DashboardData> {
    return defer(() => {
      localStorage.setItem(this.storageKey, JSON.stringify(dashboard));
      return of(dashboard);
    });
  }

  getJobs(): Observable<JobOpportunity[]> {
    return this.http.get<JobOpportunity[]>(`${this.apiUrl}/jobs`);
  }

  createJob(job: Omit<JobOpportunity, 'id' | 'postedAt'>): Observable<JobOpportunity> {
    return this.http.post<JobOpportunity>(`${this.apiUrl}/jobs`, job);
  }

  private initialDashboard(): DashboardData {
    return {
      tasks: [
        { id: 'task-cv', title: 'Refresh my CV with recent work', category: 'Career', completed: false },
        { id: 'task-angular', title: 'Review one Angular interview topic', category: 'Learning', completed: false },
        { id: 'task-role', title: 'Save two roles that feel like a fit', category: 'Career', completed: false },
        { id: 'task-walk', title: 'Take a short walk and reset', category: 'Personal', completed: false }
      ],
      routines: [
        { id: 'routine-move', name: 'Move your body', icon: '↗', hint: 'A stretch, a walk, anything counts.', done: false },
        { id: 'routine-meal', name: 'Eat something nourishing', icon: '✳', hint: 'Give yourself a little energy.', done: false },
        { id: 'routine-learn', name: 'Learn something small', icon: '⌁', hint: 'Progress can be just 15 minutes.', done: false }
      ],
      waterGlasses: 0,
      roadmap: [
        { id: 'step-reset', title: 'Reset your story', description: 'List your strengths, wins, and what you want next.', date: 'This week', completed: false },
        { id: 'step-profile', title: 'Refresh your profile', description: 'Update your CV and professional profile.', date: 'Next', completed: false },
        { id: 'step-practice', title: 'Practice with confidence', description: 'Work through a few interview questions.', date: 'Ongoing', completed: false },
        { id: 'step-connect', title: 'Connect and apply', description: 'Reach out, share, and explore opportunities.', date: 'Ongoing', completed: false }
      ],
      journalEntries: []
    };
  }
}
