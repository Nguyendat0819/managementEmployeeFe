export interface PageRequest {
  page?: number;
  size?: number;
  sort?: string;            // sort 1 cột (giữ tương thích cũ)
  sortDirection?: 'DESC' | 'ASC';
  sorts?: string[];
  search?: string;
}
