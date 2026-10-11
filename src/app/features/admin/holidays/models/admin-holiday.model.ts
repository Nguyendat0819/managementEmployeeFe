export interface AdminHoliday {
  id: number;
  name: string;
  holidayType: string;
  holidayDate: string;
  holidayDateEnd: string;
  dayCount: number;
  notes: string;
  status: 'Sắp tới' | 'Đang diễn ra' | 'Đã qua';
}
