export interface User {
  id: string;
  name: string;
  role: 'admin' | 'guru' | 'pk_ko';
  email: string;
}

export interface Student {
  id: string;
  nama: string;
  kelas: string;
  unit_uniform: string;
  kelab_persatuan: string;
  sukan_permainan: string;
  kehadiran_purata: number;
}

export interface StatData {
  name: string;
  value: number;
  fill?: string;
}

export interface DashboardStats {
  kehadiran_bulanan: StatData[];
  pecahan_unit: StatData[];
  pencapaian_terkini: number;
  total_pelajar: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}

export enum ViewState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
}