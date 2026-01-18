import { ApiResponse, DashboardStats, Student, User } from '../types';

const API_URL = "https://script.google.com/macros/s/AKfycbwpjBajVe3CUGXxBA0VlMWOlW2i2ul_Et9aoDKfsTRCJ0DObhRF1DvrxGmGfFzwdl65Tw/exec";

// Helper to handle GAS redirects and JSON parsing
async function fetchGAS<T>(params: Record<string, string>): Promise<T> {
  const url = new URL(API_URL);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      redirect: "follow", // Important for GAS Web Apps
      // Avoid adding custom headers to keep it a "Simple Request" and avoid CORS preflight issues
    });

    if (!response.ok) {
      throw new Error(`Ralat rangkaian: ${response.status}`);
    }

    const json = await response.json();
    return json as T;
  } catch (error) {
    // Log as warning instead of error to avoid console noise when falling back
    console.warn("API Error (switching to offline/mock mode):", error);
    throw error;
  }
}

export const apiService = {
  login: async (identifier: string): Promise<User> => {
    // Call: ?action=login&q=identifier
    try {
      const res = await fetchGAS<ApiResponse<User>>({ action: 'login', q: identifier });
      if (res.status === 'success' && res.data) {
        return res.data;
      }
      throw new Error(res.message || "Log masuk gagal");
    } catch (e) {
      console.warn("Menggunakan data simulasi untuk demo.");
      // Fallback mock for demo purposes
      await new Promise(r => setTimeout(r, 800));
      
      if (identifier.length >= 3) {
        return {
          id: identifier.toUpperCase(),
          name: 'Cikgu Azman Bin Ali',
          role: 'guru',
          email: identifier.includes('@') ? identifier : 'azman@sekolah.edu.my'
        };
      }
      throw new Error("Pengguna tidak dijumpai");
    }
  },

  getData: async (userId: string): Promise<Student[]> => {
    try {
      const res = await fetchGAS<ApiResponse<Student[]>>({ action: 'data', id: userId });
      if (res.status === 'success' && res.data) {
        return res.data;
      }
      return [];
    } catch (e) {
      // Extended Mock data for better demo experience
      return [
        { id: '1', nama: 'Ahmad Albab', kelas: '5 Anggerik', unit_uniform: 'KRS', kelab_persatuan: 'Bahasa Melayu', sukan_permainan: 'Bola Sepak', kehadiran_purata: 85 },
        { id: '2', nama: 'Siti Sarah', kelas: '5 Anggerik', unit_uniform: 'PBSM', kelab_persatuan: 'STEM', sukan_permainan: 'Bola Jaring', kehadiran_purata: 92 },
        { id: '3', nama: 'Chong Wei', kelas: '4 Bakawali', unit_uniform: 'Pengakap', kelab_persatuan: 'Robotik', sukan_permainan: 'Badminton', kehadiran_purata: 78 },
        { id: '4', nama: 'Muthu Sami', kelas: '4 Cempaka', unit_uniform: 'KRS', kelab_persatuan: 'Sejarah', sukan_permainan: 'Olahraga', kehadiran_purata: 88 },
        { id: '5', nama: 'Jessica Tan', kelas: '3 Dahlia', unit_uniform: 'Pandu Puteri', kelab_persatuan: 'Koir', sukan_permainan: 'Ping Pong', kehadiran_purata: 95 },
        { id: '6', nama: 'Nurul Huda', kelas: '3 Dahlia', unit_uniform: 'Puteri Islam', kelab_persatuan: 'Agama Islam', sukan_permainan: 'Bola Tampar', kehadiran_purata: 90 },
        { id: '7', nama: 'Raju A/L Gopal', kelas: '5 Bestari', unit_uniform: 'Pengakap', kelab_persatuan: 'Bahasa Inggeris', sukan_permainan: 'Catur', kehadiran_purata: 82 },
        { id: '8', nama: 'Lim Mei Ling', kelas: '4 Cempaka', unit_uniform: 'PBSM', kelab_persatuan: 'Matematik', sukan_permainan: 'Bola Keranjang', kehadiran_purata: 96 },
      ];
    }
  },

  getStats: async (userId: string): Promise<DashboardStats> => {
    try {
      const res = await fetchGAS<ApiResponse<DashboardStats>>({ action: 'statistik', id: userId });
      if (res.status === 'success' && res.data) {
        return res.data;
      }
      throw new Error("Gagal muat statistik");
    } catch (e) {
      return {
        kehadiran_bulanan: [
          { name: 'Jan', value: 85 },
          { name: 'Feb', value: 88 },
          { name: 'Mac', value: 92 },
          { name: 'Apr', value: 80 },
          { name: 'Mei', value: 85 },
          { name: 'Jun', value: 90 },
        ],
        pecahan_unit: [
          { name: 'KRS', value: 30, fill: '#3b82f6' },
          { name: 'Pengakap', value: 45, fill: '#ef4444' },
          { name: 'PBSM', value: 25, fill: '#10b981' },
          { name: 'Pandu Puteri', value: 35, fill: '#f59e0b' },
          { name: 'Puteri Islam', value: 20, fill: '#8b5cf6' },
        ],
        pencapaian_terkini: 88,
        total_pelajar: 153
      };
    }
  },

  generatePdfUrl: (userId: string): string => {
    return `${API_URL}?action=pdf&id=${userId}`;
  }
};