export type Job = {
  id: string;
  title: string;
  description: string;
  location: string;
  type: 'Full-time' | 'Internship' | 'Contract';
  salary_range?: string;
  is_active: boolean;
  created_at: string;
};

export type ApplicationStatus = 'Applied' | 'Under Review' | 'Interview' | 'Accepted' | 'Rejected';

export type Candidate = {
  id: string;
  clerk_user_id?: string;
  full_name: string;
  email: string;
  phone: string;
  linkedin_url?: string;
  portfolio_url?: string;
  resume_url: string;
  job_id: string;
  status: ApplicationStatus;
  created_at: string;
  // Joined from jobs table
  jobs?: { title: string; location: string; type: string };
};
