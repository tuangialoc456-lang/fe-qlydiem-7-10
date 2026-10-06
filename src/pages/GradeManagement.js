import React, { useState, useEffect, useContext } from 'react';
import { classAPI, gradeAPI } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import OtpModal from '../components/OtpModal';

export default function GradeManagement() {
  const { user } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  // State Token cho Giảng viên
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [inputToken, setInputToken] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Kiểm tra vai trò người dùng
  const isAdmin = user?.vaiTro === 'ADMIN';
  const isGiangVien = user?.vaiTro === 'GIANG_VIEN';

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const res = await classAPI.danhSach();
      setClasses(res.data || []);
    } catch (err) {
      setAlert({ 
        type: 'error', 
        message: err.response?.data?.message || 'Lỗi tải danh sách lớp' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClass = async (classId) => {
    if (!classId) {
      setSelectedClass(null);
      setGrades([]);
      return;
    }

    try {
      setSelectedClass(classId);
      const res = await gradeAPI.diemTheoLop(classId);
      setGrades(res.data || []);
    } catch (err) {
      setGrades([]);
      setAlert({ 
        type: 'error', 
        message: err.response?.data?.message || 'Lỗi tải danh sách điểm' 
      });
    }
  };

  const handleEditStart = (grade) => {
    setEditingId(grade.id);
    setEditValues({
      diemChuyenCan: grade.diemChuyenCan ?? '',
      diemGiuaKy: grade.diemGiuaKy ?? '',
      diemCuoiKy: grade.diemCuoiKy ?? '',
    });
  };

  const handleEditChange = (field, value) => {
    const num = value === '' ? null : parseFloat(value);
    if (num !== null && (num < 0 || num > 10)) {
      setAlert({ type: 'warning', message: 'Điểm phải từ 0-10' });
      return;
    }
    setEditValues({ ...editValues, [field]: num });
  };

  const handleSaveDiem = async (id) => {
    try {
      await gradeAPI.capNhatDiem(id, editValues);
      setAlert({ type: 'success', message: 'Cập nhật điểm thành công' });
      setEditingId(null);
      
      if (selectedClass) {
        const res = await gradeAPI.diemTheoLop(selectedClass);
        setGrades(res.data || []);
      }
    } catch (err) {
      setAlert({ 
        type: 'error', 
        message: err.response?.data?.message || 'Lỗi cập nhật điểm' 
      });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setInputToken(event.target.result.trim());
      };
      reader.readAsText(file);
    }
  };

  const handleUnlockTable = () => {
    if (!inputToken) {
      setAlert({ type: 'warning', message: 'Vui lòng nhập mã Token hoặc nạp file .key!' });
      return;
    }
    setIsUnlocked(true);
    setAlert({ type: 'success', message: 'Mở khóa bảng điểm thành công!' });
  };

  if (loading) return <Loading />;

  const selectedClassData = classes.find(c => String(c.id) === String(selectedClass));

  return (
    <div className="main-content">
      <div className="card">
        <h2>{isAdmin ? '📊 Xem & Quản lý Bảng điểm Sinh viên' : '✏️ Nhập & Chốt điểm Lớp học phần'}</h2>
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        {/* CHỈ HIỂN THỊ KHUNG TOKEN KHI LÀ GIẢNG VIÊN */}
        {isGiangVien && (
          <div style={{
            background: '#fffbe6',
            border: '1px solid #ffe58f',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, color: '#d46b08' }}>🔑 Token Bảo mật Nhập điểm Cá nhân</h4>
              <button 
                className="btn btn-primary" 
                onClick={() => setIsOtpModalOpen(true)}
                style={{ backgroundColor: '#1677ff', borderColor: '#1677ff' }}
              >
                🔑 Cấp mới & Tải File Token (.key)
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Nhập mã Token..."
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #d9d9d9', minWidth: '220px' }}
              />
              <span>Hoặc nạp file:</span>
              <input type="file" accept=".key" onChange={handleFileUpload} />
              <button className="btn btn-success" onClick={handleUnlockTable}>
                Mở khóa Bảng điểm
              </button>
            </div>
          </div>
        )}

        {/* SELECT CHỌN LỚP HỌC PHẦN */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold' }}>Chọn lớp giảng dạy / quản lý:</label>
          <select 
            value={selectedClass || ''} 
            onChange={(e) => {
              const val = e.target.value ? parseInt(e.target.value, 10) : null;
              handleSelectClass(val);
            }}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">-- Chọn lớp --</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.maLop} - {cls.monHoc?.tenMonHoc || 'Môn học'} - HK{cls.hocKy} ({cls.namHoc}) {cls.daChot ? '🔒' : ''}
              </option>
            ))}
          </select>
        </div>

        {selectedClassData && (
          <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef' }}>
            <p style={{ margin: '4px 0' }}><strong>Lớp:</strong> {selectedClassData.maLop}</p>
            <p style={{ margin: '4px 0' }}><strong>Giảng viên phụ trách:</strong> {selectedClassData.giangVien?.hoTen || 'Chưa phân công'}</p>
            <p style={{ margin: '4px 0' }}><strong>Trạng thái bảng điểm:</strong> {selectedClassData.daChot ? '🔒 Đã chốt & Ký số' : '📝 Đang mở nhập điểm'}</p>
          </div>
        )}

      {grades.length > 0 && (
  <table>
    <thead>
      <tr>
        <th>STT</th>
        <th>Mã SV</th>
        <th>Họ và Tên</th>
        <th>Chuyên cần</th>
        <th>Giữa kỳ</th>
        <th>Cuối kỳ</th>
        <th>Tổng kết</th>
        <th>Xếp loại</th>
        <th>Trạng thái</th>
        {isGiangVien && <th>Thao tác</th>}
      </tr>
    </thead>
    <tbody>
      {grades.map((grade, index) => (
        <tr 
          key={grade.id} 
          style={grade.daBiSuaTraiPhep ? { backgroundColor: '#fff0f0' } : {}}
        >
          <td>{index + 1}</td>
          {/* LẤY DỮ LIỆU TỪ CỘT maSo TRONG DATABASE */}
          <td><strong>{grade.sinhVien?.maSo || grade.sinhVien?.maSinhVien || '-'}</strong></td>
          <td>
            {grade.sinhVien?.hoTen || '-'}
            {grade.daBiSuaTraiPhep && (
              <div style={{ color: '#d9534f', fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>
                ⚠ {grade.canhBao || 'Dữ liệu bị sửa trái phép!'}
              </div>
            )}
          </td>
                  <td>
                    {isGiangVien && editingId === grade.id ? (
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={editValues.diemChuyenCan === null ? '' : editValues.diemChuyenCan}
                        onChange={(e) => handleEditChange('diemChuyenCan', e.target.value)}
                        style={{ width: '65px' }}
                      />
                    ) : (
                      grade.diemChuyenCan !== null && grade.diemChuyenCan !== undefined ? Number(grade.diemChuyenCan).toFixed(2) : '-'
                    )}
                  </td>
                  <td>
                    {isGiangVien && editingId === grade.id ? (
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={editValues.diemGiuaKy === null ? '' : editValues.diemGiuaKy}
                        onChange={(e) => handleEditChange('diemGiuaKy', e.target.value)}
                        style={{ width: '65px' }}
                      />
                    ) : (
                      grade.diemGiuaKy !== null && grade.diemGiuaKy !== undefined ? Number(grade.diemGiuaKy).toFixed(2) : '-'
                    )}
                  </td>
                  <td>
                    {isGiangVien && editingId === grade.id ? (
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={editValues.diemCuoiKy === null ? '' : editValues.diemCuoiKy}
                        onChange={(e) => handleEditChange('diemCuoiKy', e.target.value)}
                        style={{ width: '65px' }}
                      />
                    ) : (
                      grade.diemCuoiKy !== null && grade.diemCuoiKy !== undefined ? Number(grade.diemCuoiKy).toFixed(2) : '-'
                    )}
                  </td>
                  <td><strong>{grade.diemTongKet !== null && grade.diemTongKet !== undefined ? Number(grade.diemTongKet).toFixed(2) : '-'}</strong></td>
                  <td>{grade.xepLoai || '-'}</td>
                  <td>
                    {grade.daKy || selectedClassData?.daChot ? (
                      <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>🔒 Đã chốt & ký</span>
                    ) : (
                      <span style={{ color: '#e65100' }}>📝 Chưa chốt</span>
                    )}
                  </td>
                  {isGiangVien && (
                    <td>
                      {editingId === grade.id ? (
                        <div className="table-actions">
                          <button className="edit-btn" onClick={() => handleSaveDiem(grade.id)}>Lưu</button>
                          <button className="delete-btn" onClick={() => setEditingId(null)}>Hủy</button>
                        </div>
                      ) : (
                        <button
                          className="edit-btn"
                          onClick={() => handleEditStart(grade)}
                          disabled={selectedClassData?.daChot || !isUnlocked}
                        >
                          Sửa
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {selectedClass && grades.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Chưa có sinh viên trong lớp này
          </div>
        )}
      </div>

      {/* MODAL OTP DÀNH CHO GIẢNG VIÊN */}
      {isGiangVien && (
        <OtpModal
          isOpen={isOtpModalOpen}
          onClose={() => setIsOtpModalOpen(false)}
          userEmail={user?.email}
          onSuccess={(msg) => setAlert({ type: 'success', message: msg })}
        />
      )}
    </div>
  );
}