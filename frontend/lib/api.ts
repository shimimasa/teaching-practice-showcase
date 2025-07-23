import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Axiosインスタンスの作成
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター（認証トークンの自動付与）
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター（エラーハンドリング）
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 認証エラーの場合はトークンを削除してログインページへリダイレクト
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API関数
export const authAPI = {
  register: (data: { email: string; password: string; name: string; bio?: string; specialties?: string[] }) => 
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) => 
    api.post('/auth/login', data),
  
  getMe: () => 
    api.get('/auth/me'),
  
  updateProfile: (data: { name?: string; bio?: string; specialties?: string[]; contactEnabled?: boolean }) =>
    api.put('/auth/profile', data),
};

export const practiceAPI = {
  getAll: (params?: { page?: number; limit?: number; subject?: string; gradeLevel?: string; learningLevel?: string; specialNeeds?: boolean }) => 
    api.get('/practices', { params }),
  
  getById: (id: string) => 
    api.get(`/practices/${id}`),
  
  create: (data: any) => 
    api.post('/practices', data),
  
  update: (id: string, data: any) => 
    api.put(`/practices/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/practices/${id}`),
};

export const contactAPI = {
  send: (data: { practiceId: string; parentName: string; parentEmail: string; childAge: number; message: string }) => 
    api.post('/contacts', data),
  
  getAll: (params?: { page?: number; limit?: number; status?: string }) => 
    api.get('/contacts', { params }),
  
  getById: (id: string) => 
    api.get(`/contacts/${id}`),
  
  updateStatus: (id: string, status: 'new' | 'replied' | 'closed') => 
    api.put(`/contacts/${id}/status`, { status }),
};