import React, { useState, useEffect } from 'react';
import { registrationAPI, transcriptAPI } from '../services/api';
import Alert from '../components/Alert';
import Loading from '../components/Loading';

export default function StudentPortal() {
  const [activeTab, setActiveTab] = useState('DANG_KY'); // 'DANG_KY' hoặc 'XEM_DIEM'
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // State Đăng ký môn
  const [classes, setClasses] = useState([]);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // State Xem điểm
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    if (activeTab === 'DANG_KY') {
      loadOpenClasses();
    } else if (activeTab === 'XEM_DIEM') {
      loadMyTranscript();
    }
  }, [activeTab]);

  // --- LOGIC ĐĂNG KÝ MÔN ---
  const loadOpenClasses = async () => {
    try {
      setLoading(true);
      const res = await registrationAPI.danhSachLopMo();
      setClasses(res.data || []);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Lỗi tải danh sách lớp học phần mở',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (classId) => {
    try {
      setActionLoadingId(classId);
      const res = await registrationAPI.dangKy(classId);
      setAlert({ type: 'success', message: res.data.message || 'Đăng ký môn học thành công!' });
      await loadOpenClasses();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Lỗi khi đăng ký môn học',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelRegister = async (classId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đăng ký lớp học phần này?')) return;
    try {
      setActionLoadingId(classId);
      const res = await registrationAPI.huyDangKy(classId);
      setAlert({ type: 'success', message: res.data.message || 'Hủy đăng ký thành công!' });
      await loadOpenClasses();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Lỗi khi hủy đăng ký môn học',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // --- LOGIC XEM ĐIỂM ---
  const loadMyTranscript = async () => {
    try {
      setLoading(true);
      const res = await transcriptAPI.bangDiem();
      setGrades(res.data || []);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Lỗi tải bảng điểm cá nhân',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="card">
        {/* TAB HEADER */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
          <button
            onClick={() => { setActiveTab('DANG_KY'); setAlert(null); }}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              backgroundColor: activeTab === 'DANG_KY' ? '#1976d2' : '#e0e0e0',
              color: activeTab === 'DANG_KY' ? '#fff' : '#333',
            }}
          >
            📝 Đăng ký Môn học
          </button>
          <button
            onClick={() => { setActiveTab('XEM_DIEM'); setAlert(null); }}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              backgroundColor: activeTab === 'XEM_DIEM' ? '#1976d2' : '#e0e0e0',
              color: activeTab === 'XEM_DIEM' ? '#fff' : '#333',
            }}
          >
            📊 Xem Bảng điểm Cá nhân
          </button>
        </div>

        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        {loading ? (
          <Loading />
        ) : (
          <>
            {/* NỘI DUNG TAB 1: ĐĂNG KÝ MÔN HỌC */}
            {activeTab === 'DANG_KY' && (
              <div>
                <h3>Danh sách Lớp Học Phần Mở Đăng Ký</h3>
                {classes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                    Hiện tại không có lớp học phần nào mở đăng ký.
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Mã Lớp</th>
                        <th>Tên Môn Học</th>
                        <th>Giảng Viên</th>
                        <th>Học Kỳ / Năm</th>
                        <th>Trạng Thái</th>
                        <th>Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classes.map((cls) => (
                        <tr key={cls.id}>
                          <td><strong>{cls.maLop}</strong></td>
                          <td>{cls.monHoc?.tenMonHoc || '-'}</td>
                          <td>{cls.giangVien?.hoTen || '-'}</td>
                          <td>HK{cls.hocKy} ({cls.namHoc})</td>
                          <td>
                            {cls.daDangKy ? (
                              <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>✓ Đã đăng ký</span>
                            ) : (
                              <span style={{ color: '#757575' }}>Chưa đăng ký</span>
                            )}
                          </td>
                          <td>
                            {cls.daDangKy ? (
                              <button
                                className="btn delete-btn"
                                disabled={actionLoadingId === cls.id}
                                onClick={() => handleCancelRegister(cls.id)}
                              >
                                {actionLoadingId === cls.id ? 'Đang xử lý...' : 'Hủy đăng ký'}
                              </button>
                            ) : (
                              <button
                                className="btn edit-btn"
                                disabled={actionLoadingId === cls.id}
                                onClick={() => handleRegister(cls.id)}
                              >
                                {actionLoadingId === cls.id ? 'Đang xử lý...' : 'Đăng ký'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* NỘI DUNG TAB 2: XEM BẢNG ĐIỂM CÁ NHÂN */}
            {activeTab === 'XEM_DIEM' && (
              <div>
                <h3>Kết Quả Học Tập Cá Nhân</h3>
                {grades.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                    Bạn chưa có dữ liệu điểm học phần nào.
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Mã Lớp</th>
                        <th>Môn Học</th>
                        <th>Chuyên cần (20%)</th>
                        <th>Giữa kỳ (30%)</th>
                        <th>Cuối kỳ (50%)</th>
                        <th>Điểm Tổng Kết</th>
                        <th>Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map((item, index) => {
                        const cc = item.diemChuyenCan ?? 0;
                        const gk = item.diemGiuaKy ?? 0;
                        const ck = item.diemCuoiKy ?? 0;
                        const tongKet = item.diemTongKet ? item.diemTongKet.toFixed(1) : (cc * 0.2 + gk * 0.3 + ck * 0.5).toFixed(1);

                        return (
                          <tr 
                            key={item.id || index}
                            style={item.daBiSuaTraiPhep ? { backgroundColor: '#fff0f0' } : {}}
                          >
                            <td>{index + 1}</td>
                            <td><strong>{item.lopHocPhan?.maLop || '-'}</strong></td>
                            <td>{item.lopHocPhan?.monHoc?.tenMonHoc || '-'}</td>
                            <td>{item.diemChuyenCan ?? '-'}</td>
                            <td>{item.diemGiuaKy ?? '-'}</td>
                            <td>{item.diemCuoiKy ?? '-'}</td>
                            <td>
                              <strong style={{ color: item.daBiSuaTraiPhep ? '#c62828' : (tongKet >= 4.0 ? '#2e7d32' : '#c62828') }}>
                                {tongKet}
                              </strong>
                            </td>
                            <td>
                              {item.daBiSuaTraiPhep ? (
                                <div style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                                  {item.canhBao || '⚠️ Điểm không hợp lệ, phát hiện sửa điểm trái phép!'}
                                </div>
                              ) : item.daKy ? (
                                <div>
                                  <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>🔒 Đã chốt & ký</span>
                                  {item.thongBaoKhoiPhuc && (
                                    <div style={{ color: '#1b5e20', fontSize: '11px', marginTop: '2px', fontWeight: 'bold' }}>
                                      {item.thongBaoKhoiPhuc}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span style={{ color: '#e65100' }}>⏳ Chưa chốt</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}