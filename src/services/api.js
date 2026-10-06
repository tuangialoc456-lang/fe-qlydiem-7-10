import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api',
});

// Tự động gắn Token JWT vào Header nếu đã đăng nhập
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  dangNhap: (email, matKhau) => API.post('/auth/dang-nhap', { email, matKhau }),
  dangKy: (data) => API.post('/auth/dang-ky', data),
  quenMatKhau: (email) => API.post('/auth/quen-mat-khau', { email }),
  datLaiMatKhau: (data) => API.post('/auth/dat-lai-mat-khau', data),
};

export const userAPI = {
  getAll: () => API.get('/nguoi-dung'),
  getById: (id) => API.get(`/nguoi-dung/${id}`),
  create: (data) => API.post('/nguoi-dung', data),
  update: (id, data) => API.put(`/nguoi-dung/${id}`, data),
  delete: (id) => API.delete(`/nguoi-dung/${id}`),
  
  danhSach: () => API.get('/nguoi-dung'),
  chiTiet: (id) => API.get(`/nguoi-dung/${id}`),
  taoNguoiDung: (data) => API.post('/nguoi-dung', data),
  capNhat: (id, data) => API.put(`/nguoi-dung/${id}`, data),
  xoa: (id) => API.delete(`/nguoi-dung/${id}`),
};

export const subjectAPI = {
  getAll: () => API.get('/mon-hoc'),
  getById: (id) => API.get(`/mon-hoc/${id}`),
  create: (data) => API.post('/mon-hoc', data),
  update: (id, data) => API.put(`/mon-hoc/${id}`, data),
  delete: (id) => API.delete(`/mon-hoc/${id}`),

  danhSach: () => API.get('/mon-hoc'),
  chiTiet: (id) => API.get(`/mon-hoc/${id}`),
  taoMonHoc: (data) => API.post('/mon-hoc', data),
  capNhat: (id, data) => API.put(`/mon-hoc/${id}`, data),
  xoa: (id) => API.delete(`/mon-hoc/${id}`),
};

export const classAPI = {
  getAll: () => API.get('/lop-hoc-phan'),
  getById: (id) => API.get(`/lop-hoc-phan/${id}`),
  create: (data) => API.post('/lop-hoc-phan', data),
  update: (id, data) => API.put(`/lop-hoc-phan/${id}`, data),
  delete: (id) => API.delete(`/lop-hoc-phan/${id}`),

  danhSach: () => API.get('/lop-hoc-phan'),
  chiTiet: (id) => API.get(`/lop-hoc-phan/${id}`),
  taoLop: (data) => API.post('/lop-hoc-phan', data),
  capNhat: (id, data) => API.put(`/lop-hoc-phan/${id}`, data),
  xoa: (id) => API.delete(`/lop-hoc-phan/${id}`),
};

export const gradeAPI = {
  getAll: () => API.get('/diem'),
  getByClass: (classId) => API.get(`/diem/lop/${classId}`),
  save: (data) => API.post('/diem', data),
  update: (id, data) => API.put(`/diem/${id}`, data),

  danhSachLop: () => API.get('/lop-hoc-phan'),
  layTheoLop: (classId) => API.get(`/diem/lop/${classId}`),
  diemTheoLop: (classId) => API.get(`/diem/lop/${classId}`),
  luuDiem: (data) => API.post('/diem', data),
  capNhatDiem: (id, data) => API.put(`/diem/${id}`, data),
  chotKyLop: (classId, data) => API.post(`/diem/lop/${classId}/chot-ky`, data),

  taoToken: () => API.post('/diem/tao-token'),
  xacThucToken: (data) => API.post('/diem/xac-thuc-token', data),
};

// BỔ SUNG: Khai báo API Token xác thực OTP
export const tokenAPI = {
  requestOtp: () => API.post('/token/request-otp'),
  verifyOtpAndGenerate: (otp) => API.post('/token/verify-otp-and-generate', { otp }, { responseType: 'blob' }),
};

export const transcriptAPI = {
  bangDiem: (studentId) => API.get(studentId ? `/bang-diem/${studentId}` : '/diem/me'),
  getTranscript: (studentId) => API.get(studentId ? `/bang-diem/${studentId}` : '/diem/me'),
};

export const registrationAPI = {
  danhSachLopMo: () => API.get('/dang-ky-hoc/lop-mo'),
  dangKy: (classId) => API.post(`/dang-ky-hoc/${classId}`),
  huyDangKy: (classId) => API.delete(`/dang-ky-hoc/${classId}`),
};

export const auditAPI = {
  getAll: (params) => API.get('/nhat-ky', { params }),
  danhSach: (params) => API.get('/nhat-ky', { params }),
  danhSachNhatKy: (params) => API.get('/nhat-ky', { params }),
};

export default API;