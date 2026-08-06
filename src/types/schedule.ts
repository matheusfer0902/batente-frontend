export const scheduleShiftTypes = ["FIXED", "ROTATING"] as const;
export type ScheduleShiftType = (typeof scheduleShiftTypes)[number];

export interface ScheduleListItem {
  id: string;
  name: string;
  weeklyHours: number;
  employeeCount: number;
  shiftType: ScheduleShiftType;
}
