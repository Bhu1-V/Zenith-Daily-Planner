export enum ItemType {
  CHECKBOX,
  TEXT_SHORT,
  TEXT_LONG,
  CHECKBOX_WITH_TEXT,
}

export interface BaseTask {
  id: string;
  label: string;
  description?: string;
  isSignal?: boolean;
}

export interface CheckboxTask extends BaseTask {
  type: ItemType.CHECKBOX;
  checked: boolean;
}

export interface TextTask extends BaseTask {
  type: ItemType.TEXT_SHORT | ItemType.TEXT_LONG;
  value: string;
}

export interface CheckboxWithTextTask extends BaseTask {
  type: ItemType.CHECKBOX_WITH_TEXT;
  checked: boolean;
  value: string;
}

export type Task = CheckboxTask | TextTask | CheckboxWithTextTask;

export interface PlannerSectionData {
  id: string;
  title: string;
  goal?: string;
  icon: string;
  tasks: Task[];
  startTime?: string;
  endTime?: string;
  isTimeboxed?: boolean;
  color?: string;
}

export interface UniversalTrackers {
  urges: number;
  paydayChecked: boolean;
  dailyWin: string;
}

export interface DayReview {
  signalProductivity: number; // Percentage
  absoluteProductivity: number; // Percentage
  note: string;
}

export interface DailyPlan {
  date: string; // YYYY-MM-DD
  isConfirmed: boolean;
  sections: PlannerSectionData[];
  trackers: UniversalTrackers;
  review?: DayReview;
}

export type PlannerData = {
  [date: string]: DailyPlan;
};