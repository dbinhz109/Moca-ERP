// API types mirrored from backend/api/erp.api

export type RagStatus = "green" | "amber" | "red";
export type TaskStatus = "new" | "in_progress" | "pending_review" | "done" | "rejected";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type MeetingType = "review" | "standup" | "board" | "other";
export type ProjectType = "research" | "product" | string;

export interface UserInfo {
  id: string;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
}

export interface UpdateProfileReq {
  full_name: string;
  phone: string;
}

export interface ChangePasswordReq {
  current_password: string;
  new_password: string;
}

export interface LoginReq {
  username: string;
  password: string;
}

export interface LoginResp {
  token: string;
  expires_at: number;
  user: UserInfo;
}

export interface WorkspaceResp {
  id: string;
  name: string;
  description: string;
  color: string;
  owner_id: string;
  project_count: number;
  created_at: string;
}

export interface CreateWorkspaceReq {
  name: string;
  description?: string;
  color?: string;
}

export interface ProjectResp {
  id: string;
  code: string;
  name: string;
  type: string;
  status: string;
  rag_status: RagStatus;
  rag_override: boolean;
  progress: number;
  start_date: string;
  end_date: string;
  pm_id: string;
  pm_name: string;
  member_count: number;
  task_count: number;
  workspace_id?: string;
  bonus_pool: number;
  bonus_allocated: number;
  created_at: string;
}

export interface ProjectListResp {
  total: number;
  projects: ProjectResp[];
}

export interface ProjectMemberResp {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: string;
  project_role: string;
  avatar?: string;
  bonus_amount: number;
}

export interface AddProjectMemberReq {
  user_id: string;
  bonus_amount?: number;
}

export interface CreateProjectReq {
  workspace_id?: string;
  code: string;
  name: string;
  type: string;
  description?: string;
  start_date: string;
  end_date: string;
  bonus_pool?: number;
}

export interface PhaseResp {
  id: string;
  project_id: string;
  name: string;
  weight: number;
  progress: number;
  start_date?: string;
  end_date?: string;
  sort_order: number;
  task_count: number;
}

export interface CreatePhaseReq {
  name: string;
  weight: number;
  start_date?: string;
  end_date?: string;
  sort_order?: number;
}

export interface TaskResp {
  id: string;
  project_id: string;
  phase_id: string;
  parent_id?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id?: string;
  assignee_name?: string;
  assignee_avatar?: string;
  due_date?: string;
  estimated_hours: number;
  actual_hours: number;
  is_overdue: boolean;
  column_position: number;
  created_by?: string;
  assignees: TaskAssignee[];
  done_count: number;
  assignee_count: number;
  created_at: string;
}

export interface TaskAssignee {
  id: string;
  full_name: string;
  avatar?: string;
  is_done: boolean;
}

export interface AddTaskAssigneeReq {
  user_id: string;
}

export interface MyProgressReq {
  done: boolean;
}

export interface CreateTaskReq {
  phase_id: string;
  title: string;
  description?: string;
  assignee_id?: string;
  priority: TaskPriority;
  due_date?: string;
  estimated_hours?: number;
}

export interface TaskCommentResp {
  id: string;
  task_id: string;
  author_id: string;
  author: UserInfo;
  content: string;
  created_at: string;
}

export interface TaskCommentReq {
  content: string;
}

export interface ApproveTaskReq {
  action: "approve" | "reject";
  comment?: string;
}

export interface UpdateTaskStatusReq {
  status: TaskStatus;
}

export interface MeetingResp {
  id: string;
  title: string;
  type: MeetingType;
  status: string;
  start_time: string;
  end_time: string;
  location?: string;
  meeting_url?: string;
  project_id?: string;
  project_name?: string;
  organizer_id: string;
  attendees: UserInfo[];
  notes?: string;
  created_at: string;
}

export interface MeetingListResp {
  total: number;
  meetings: MeetingResp[];
}

export interface CreateMeetingReq {
  title: string;
  type: MeetingType;
  start_time: string;
  end_time?: string;
  location?: string;
  meeting_url?: string;
  project_id?: string;
  attendee_ids?: string[];
  is_recurring?: boolean;
  recurrence_rule?: string;
}

export interface NotificationResp {
  id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  ref_id?: string;
  ref_type?: string;
  created_at: string;
}

export interface CommonResp {
  message: string;
}

// ─── Notification channels (Telegram / Zalo) ───────────────────────

export interface NotificationConfigResp {
  telegram_enabled: boolean;
  telegram_token_set: boolean;
  zalo_enabled: boolean;
  zalo_token_set: boolean;
}

export interface UpdateNotificationConfigReq {
  telegram_enabled: boolean;
  telegram_bot_token?: string;
  zalo_enabled: boolean;
  zalo_oa_token?: string;
}

export interface NotificationSettingsResp {
  telegram_chat_id: string;
  zalo_user_id: string;
  telegram_on: boolean;
  zalo_on: boolean;
  notify_assigned: boolean;
  notify_review: boolean;
  notify_decision: boolean;
  notify_comment: boolean;
}

export type UpdateNotificationSettingsReq = NotificationSettingsResp;
