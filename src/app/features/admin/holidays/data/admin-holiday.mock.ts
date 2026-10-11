import { AdminHoliday } from '../models/admin-holiday.model';

export const ADMIN_HOLIDAYS: AdminHoliday[] = [
  { id: 1, name: 'Tết Dương lịch', holidayType: 'Ngày lễ quốc gia', holidayDate: '01/01/2026', holidayDateEnd: '01/01/2026', dayCount: 1, notes: 'Nghỉ 01 ngày theo lịch nhà nước.', status: 'Đã qua' },
  { id: 2, name: 'Tết Nguyên Đán', holidayType: 'Tết cổ truyền', holidayDate: '16/02/2026', holidayDateEnd: '20/02/2026', dayCount: 5, notes: 'Lịch nghỉ Tết Nguyên Đán năm 2026.', status: 'Đã qua' },
  { id: 3, name: 'Giỗ Tổ Hùng Vương', holidayType: 'Ngày lễ quốc gia', holidayDate: '26/04/2026', holidayDateEnd: '26/04/2026', dayCount: 1, notes: '', status: 'Đã qua' },
  { id: 4, name: 'Ngày Giải phóng miền Nam', holidayType: 'Ngày lễ quốc gia', holidayDate: '30/04/2026', holidayDateEnd: '30/04/2026', dayCount: 1, notes: '', status: 'Đã qua' },
  { id: 5, name: 'Ngày Quốc tế Lao động', holidayType: 'Ngày lễ quốc gia', holidayDate: '01/05/2026', holidayDateEnd: '01/05/2026', dayCount: 1, notes: '', status: 'Đã qua' },
  { id: 6, name: 'Quốc khánh', holidayType: 'Ngày lễ quốc gia', holidayDate: '02/09/2026', holidayDateEnd: '02/09/2026', dayCount: 1, notes: 'Nghỉ Quốc khánh.', status: 'Đã qua' },
  { id: 7, name: 'Tết Dương lịch', holidayType: 'Ngày lễ quốc gia', holidayDate: '01/01/2027', holidayDateEnd: '01/01/2027', dayCount: 1, notes: '', status: 'Sắp tới' },
  { id: 8, name: 'Tết Nguyên Đán', holidayType: 'Tết cổ truyền', holidayDate: '06/02/2027', holidayDateEnd: '10/02/2027', dayCount: 5, notes: 'Dự kiến theo lịch nghỉ Tết năm 2027.', status: 'Sắp tới' },
];
