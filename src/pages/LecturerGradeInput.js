import React, { useState, useEffect } from 'react';
import { gradeAPI, classAPI } from '../services/api';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import OtpModal from '../components/OtpModal'; // 1. Import OtpModal

export default function LecturerGradeInput() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [editGrades, setEditGrades] = useState({});

  // State quản lý Token xác thực & Modal OTP
  const [tokenInput, setTokenInput] = useState('');
  const [isTokenVerified, setIsTokenVerified] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false); // 2. State ẩn/hiện Modal OTP

  // State quản lý Modal xác nhận Chốt & Ký số
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Lấy thông tin giảng viên đang đăng nhập
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadLecturerClasses();
  }, []);

  const loadLecturerClasses = async () => {
    try {
      setLoading(true);
      const res = await classAPI.danhSach();
      const user = currentUser;
      const myClasses = (res.data || []).filter(
        (cls) => cls.giangVienId === user.id || cls.giangVien?.id === user.id
      );
      setClasses(myClasses);
      if (myClasses.length > 0) {
        setSelectedClass(myClasses[0].id);
        loadGradesByClass(myClasses[0].id);
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Lỗi tải danh sách lớp học phần' });
    } finally {
      setLoading(false);
    }
  };

  const loadGradesByClass = async (classId) => {
    try {
      setLoading(true);
      const res = await gradeAPI.diemTheoLop(classId);
      const data = res.data || [];
      setStudents(data);

      const initialEdits = {};
      data.forEach((item) => {
        initialEdits[item.id] = {
          diemChuyenCan: item.diemChuyenCan ?? '',
          diemGiuaKy: item.diemGiuaKy ?? '',
          diemCuoiKy: item.diemCuoiKy ?? '',
        };
      });
      setEditGrades(initialEdits);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Lỗi tải điểm' });
    } finally {
      setLoading(false);
    }
  };

  // 1. MỞ MODAL XÁC THỰC OTP
  const handleOpenOtpModal = () => {
    setIsOtpModalOpen(true);
  };

  // 2. ĐỌC FILE TOKEN KHI UPLOAD (.txt hoặc .key)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const textContent = event.target.result ? event.target.result.trim() : '';
        setTokenInput(textContent);
      };
      reader.readAsText(file);
    }
  };

  // 3. XÁC THỰC TOKEN VỚI BACKEND
  const handleVerifyToken = async () => {
    if (!tokenInput) {
      setAlert({ type: 'warning', message: 'Vui lòng nhập Token hoặc chọn file Token (.key)!' });
      return;
    }
    try {
      await gradeAPI.xacThucToken({ token: tokenInput });
      setIsTokenVerified(true);
      setAlert({ type: 'success', message: '🔑 Xác thực Token thành công! Đã mở khóa quyền nhập và chốt điểm.' });
    } catch (err) {
      setIsTokenVerified(false);
      setAlert({ type: 'error', message: err.response?.data?.message || 'Token bảo mật không chính xác!' });
    }
  };

  const handleGradeChange = (enrollmentId, field, value) => {
    setEditGrades((prev) => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        [field]: value === '' ? '' : parseFloat(value),
      },
    }));
  };

  const handleSaveGrade = async (enrollmentId) => {
    try {
      setSaving(true);
      const gradeData = { ...editGrades[enrollmentId], tokenXacThuc: tokenInput };
      await gradeAPI.capNhatDiem(enrollmentId, gradeData);
      setAlert({ type: 'success', message: 'Cập nhật điểm thành công!' });
      await loadGradesByClass(selectedClass);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Lỗi lưu điểm' });
    } finally {
      setSaving(false);
    }
  };

  // Mở Pop-up xác nhận
  const handleChotKyLop = () => {
    setShowConfirmModal(true);
  };

  // Thực thi Chốt & Ký số sau khi nhấn Xác nhận trên Pop-up
  const handleConfirmChotKy = async () => {
    setShowConfirmModal(false);
    try {
      setSaving(true);
      await gradeAPI.chotKyLop(selectedClass, { tokenXacThuc: tokenInput });
      setAlert({ type: 'success', message: '🔒 Đã chốt và ký số bảng điểm gửi lên Admin thành công!' });
      await loadGradesByClass(selectedClass);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Lỗi chốt điểm' });
    } finally {
      setSaving(false);
    }
  };

  if (loading && classes.length === 0) return <Loading />;

  const currentClassObj = classes.find((c) => String(c.id) === String(selectedClass));

  return (
    <div className="main-content">
      <div className="card">
        <h2>✏️ Nhập & Chốt điểm Lớp học phần (Giảng viên)</h2>
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        {/* KHU VỰC QUẢN LÝ THÔNG TIN BẢO MẬT TOKEN LỚP 2 */}
        <div
          style={{
            padding: '15px',
            background: isTokenVerified ? '#e8f5e9' : '#fff3e0',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #ccc',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h4 style={{ margin: 0 }}>🔑 Token Bảo mật Nhập điểm Cá nhân</h4>
            {/* Nút bấm mở Pop-up OTP */}
            <button
              onClick={handleOpenOtpModal}
              className="btn"
              style={{ backgroundColor: '#0288d1', color: '#fff', fontSize: '13px', cursor: 'pointer' }}
            >
              📥 Cấp mới & Tải File Token (.key)
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '15px', flexWrap: 'wrap' }}>
            <input
              type="password"
              placeholder="Nhập mã Token..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              disabled={isTokenVerified}
              style={{ padding: '8px', width: '260px' }}
            />
            <span style={{ fontSize: '13px', color: '#666' }}>Hoặc nạp file:</span>
            <input type="file" accept=".txt,.key" onChange={handleFileUpload} disabled={isTokenVerified} />

            {!isTokenVerified ? (
              <button className="btn edit-btn" onClick={handleVerifyToken}>
                Mở khóa Bảng điểm
              </button>
            ) : (
              <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>✅ Đã mở khóa thành công</span>
            )}
          </div>
        </div>

        {/* CHỌN LỚP HỌC PHẦN */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold' }}>Chọn lớp giảng dạy:</label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              loadGradesByClass(e.target.value);
            }}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">-- Chọn lớp học phần --</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.maLop} - {cls.monHoc?.tenMonHoc || 'Môn học'} - HK{cls.hocKy} ({cls.namHoc}) {cls.daChot ? '🔒' : ''}
              </option>
            ))}
          </select>
        </div>

        {selectedClass && (
          <>
            {isTokenVerified && !currentClassObj?.daChot && (
              <div style={{ marginBottom: '15px', textAlign: 'right' }}>
                <button
                  className="btn delete-btn"
                  style={{ backgroundColor: '#2e7d32' }}
                  onClick={handleChotKyLop}
                  disabled={saving}
                >
                  🔒 Chốt & Ký số gửi Admin
                </button>
              </div>
            )}

            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã SV</th>
                  <th>Họ và Tên</th>
                  <th>Chuyên cần (20%)</th>
                  <th>Giữa kỳ (30%)</th>
                  <th>Cuối kỳ (50%)</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {students.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{item.sinhVien?.maSo || item.sinhVien?.maSinhVien || '-'}</strong>
                    </td>
                    <td>{item.sinhVien?.hoTen || '-'}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        disabled={!isTokenVerified || item.daKy}
                        value={editGrades[item.id]?.diemChuyenCan}
                        onChange={(e) => handleGradeChange(item.id, 'diemChuyenCan', e.target.value)}
                        style={{ width: '70px', padding: '4px' }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        disabled={!isTokenVerified || item.daKy}
                        value={editGrades[item.id]?.diemGiuaKy}
                        onChange={(e) => handleGradeChange(item.id, 'diemGiuaKy', e.target.value)}
                        style={{ width: '70px', padding: '4px' }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        disabled={!isTokenVerified || item.daKy}
                        value={editGrades[item.id]?.diemCuoiKy}
                        onChange={(e) => handleGradeChange(item.id, 'diemCuoiKy', e.target.value)}
                        style={{ width: '70px', padding: '4px' }}
                      />
                    </td>
                    <td>
                      {item.daKy ? (
                        <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>🔒 Đã chốt & ký</span>
                      ) : (
                        <span style={{ color: '#e65100' }}>📝 Cho phép nhập</span>
                      )}
                    </td>
                    <td>
                      {!item.daKy && (
                        <button
                          className="btn edit-btn"
                          disabled={!isTokenVerified || saving}
                          onClick={() => handleSaveGrade(item.id)}
                        >
                          Lưu
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* POPUP BẢO MẬT OTP */}
      <OtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        userEmail={currentUser?.email}
        onSuccess={(msg) => setAlert({ type: 'success', message: msg })}
      />

      {/* POPUP XÁC NHẬN CHỐT & KÝ SỐ CĂN GIỮA MÀN HÌNH */}
      {showConfirmModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              padding: '24px 28px',
              borderRadius: '10px',
              width: '420px',
              maxWidth: '90%',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔒</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#1f2937', fontSize: '20px' }}>
              Xác nhận Chốt & Ký số
            </h3>
            <p style={{ margin: '0 0 20px 0', color: '#4b5563', fontSize: '14px', lineHeight: '1.5' }}>
              Bạn có chắc chắn muốn chốt và ký số điện tử cho lớp học phần này gửi lên Admin không?<br />
              <strong style={{ color: '#d97706', marginTop: '6px', display: 'inline-block' }}>
                ⚠️ Sau khi chốt, điểm số sẽ bị khóa và không thể sửa đổi!
              </strong>
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                onClick={handleConfirmChotKy}
                disabled={saving}
                style={{
                  backgroundColor: '#2e7d32',
                  color: '#fff',
                  border: 'none',
                  padding: '9px 20px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Đồng ý Chốt
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={saving}
                style={{
                  backgroundColor: '#757575',
                  color: '#fff',
                  border: 'none',
                  padding: '9px 20px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}