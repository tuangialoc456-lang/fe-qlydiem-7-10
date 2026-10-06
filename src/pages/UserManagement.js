import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import Alert from '../components/Alert';
import Loading from '../components/Loading';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    hoTen: '',
    email: '',
    matKhau: '',
    vaiTro: 'SINH_VIEN',
    maSo: '',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await userAPI.danhSach();
      setUsers(res.data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Lỗi tải danh sách người dùng' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Chỉ gửi các thông tin được phép sửa
        const { email, matKhau, ...updateData } = formData;
        await userAPI.capNhat(editingId, updateData);
        setAlert({ type: 'success', message: 'Cập nhật người dùng thành công' });
      } else {
        await userAPI.taoNguoiDung(formData);
        setAlert({ type: 'success', message: 'Tạo người dùng thành công' });
      }
      setFormData({ hoTen: '', email: '', matKhau: '', vaiTro: 'SINH_VIEN', maSo: '' });
      setEditingId(null);
      setShowForm(false);
      loadUsers();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Lỗi lưu người dùng' });
    }
  };

  const handleEdit = (user) => {
    setFormData({
      hoTen: user.hoTen,
      email: user.email,
      vaiTro: user.vaiTro,
      maSo: user.maSo || '',
      matKhau: '',
    });
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa (vô hiệu hóa) người dùng này?')) return;
    try {
      await userAPI.xoa(id);
      setAlert({ type: 'success', message: 'Xóa người dùng thành công' });
      loadUsers();
    } catch (err) {
      setAlert({ type: 'error', message: 'Lỗi xóa người dùng' });
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="main-content">
      <div className="card">
        <h2>👥 Quản lý Người dùng</h2>
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        <button className="btn btn-primary" onClick={() => {
          setFormData({ hoTen: '', email: '', matKhau: '', vaiTro: 'SINH_VIEN', maSo: '' });
          setEditingId(null);
          setShowForm(!showForm);
        }}>
          {showForm ? '✕ Đóng' : '➕ Thêm Người dùng'}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginTop: '20px', padding: '20px', background: '#f9f9f9', borderRadius: '4px' }}>
            <h3 style={{ marginTop: 0 }}>{editingId ? '✏️ Cập nhật thông tin' : '➕ Thêm người dùng mới'}</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Họ tên:</label>
                <input type="text" name="hoTen" value={formData.hoTen} onChange={handleChange} required />
              </div>

              {/* Ô Email: Khóa khi đang ở chế độ Sửa */}
              <div className="form-group">
                <label>Email: {editingId && <span style={{ color: '#888', fontSize: '12px' }}>(🔒 Không thể đổi)</span>}</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  disabled={!!editingId}
                  style={editingId ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}}
                />
              </div>
            </div>

            <div className="form-row">
              {/* Ô Mật khẩu: Chỉ hiển thị khi TẠO MỚI */}
              {!editingId && (
                <div className="form-group">
                  <label>Mật khẩu:</label>
                  <input type="password" name="matKhau" value={formData.matKhau} onChange={handleChange} required />
                </div>
              )}

              <div className="form-group">
                <label>Vai trò:</label>
                <select name="vaiTro" value={formData.vaiTro} onChange={handleChange}>
                  <option value="SINH_VIEN">Sinh viên</option>
                  <option value="GIANG_VIEN">Giảng viên</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label>Mã số (sinh viên/giảng viên):</label>
                <input type="text" name="maSo" value={formData.maSo} onChange={handleChange} />
              </div>
            </div>

            <div className="btn-group" style={{ marginTop: '15px' }}>
              <button type="submit" className="btn btn-success">💾 Lưu</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Hủy</button>
            </div>
          </form>
        )}

        <table>
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Mã số</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', color: '#999' }}>Không có dữ liệu</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.id}>
                  <td>{user.hoTen}</td>
                  <td>{user.email}</td>
                  <td><strong>{user.vaiTro}</strong></td>
                  <td>{user.maSo || '-'}</td>
                  <td>{user.trangThai ? '✓ Hoạt động' : '✗ Vô hiệu'}</td>
                  <td>
                    <div className="table-actions">
                      <button className="edit-btn" onClick={() => handleEdit(user)}>Sửa</button>
                      <button className="delete-btn" onClick={() => handleDelete(user.id)}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}