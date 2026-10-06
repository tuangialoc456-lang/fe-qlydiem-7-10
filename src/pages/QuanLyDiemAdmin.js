import React, { useState, useEffect } from 'react';
import { classAPI, gradeAPI } from '../api';

const QuanLyDiemAdmin = () => {
  const [danhSachLop, setDanhSachLop] = useState([]);
  const [lopDuocChon, setLopDuocChon] = useState('');
  const [danhSachDiem, setDanhSachDiem] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDanhSachLop();
  }, []);

  const loadDanhSachLop = async () => {
    try {
      const res = await classAPI.getAll();
      setDanhSachLop(res.data || []);
    } catch (err) {
      alert('Lỗi tải danh sách lớp: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSelectLop = async (classId) => {
    setLopDuocChon(classId);
    if (!classId) {
      setDanhSachDiem([]);
      return;
    }

    try {
      setLoading(true);
      const res = await gradeAPI.getByClass(classId);
      setDanhSachDiem(res.data || []);
    } catch (err) {
      alert('Lỗi tải điểm lớp: ' + (err.response?.data?.message || err.message));
      setDanhSachDiem([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#1e3a8a', marginTop: 0 }}>📊 Giám Sát Bảng Điểm (ADMIN - Chỉ xem)</h2>
        
        {/* Thông báo quyền Admin */}
        <div style={{ padding: '12px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '6px', marginBottom: '20px', fontWeight: 'bold' }}>
          ℹ️ Quyền Admin: Bạn chỉ có quyền xem và giám sát điểm số do Giảng viên chốt gửi lên. Mọi thao tác nhập/sửa điểm đã bị khóa.
        </div>

        {/* Thanh chọn lớp */}
        <div style={{ marginBottom: '20px', maxWidth: '400px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
            Chọn Lớp Học Phần:
          </label>
          <select
            value={lopDuocChon}
            onChange={(e) => handleSelectLop(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          >
            <option value="">-- Chọn Lớp Học Phần --</option>
            {danhSachLop.map((lop) => (
              <option key={lop.id} value={lop.id}>
                {lop.tenLop || lop.maLop || `Lớp học phần #${lop.id}`}
              </option>
            ))}
          </select>
        </div>

        {/* Bảng xem điểm READ-ONLY */}
        {loading ? (
          <p>Đang tải dữ liệu bảng điểm...</p>
        ) : lopDuocChon && danhSachDiem.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>Chưa có dữ liệu điểm trong lớp này.</p>
        ) : lopDuocChon ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px' }}>Mã SV / Họ tên</th>
                  <th style={{ padding: '12px' }}>Chuyên cần</th>
                  <th style={{ padding: '12px' }}>Giữa kỳ</th>
                  <th style={{ padding: '12px' }}>Cuối kỳ</th>
                  <th style={{ padding: '12px' }}>Tổng kết</th>
                  <th style={{ padding: '12px' }}>Xếp loại</th>
                  <th style={{ padding: '12px' }}>Trạng thái Ký số</th>
                </tr>
              </thead>
              <tbody>
                {danhSachDiem.map((item) => {
                  const sv = item.sinhVien || {};
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>
                        <strong>{sv.hoTen || 'N/A'}</strong>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{sv.email || sv.maSo}</div>
                      </td>
                      <td style={{ padding: '12px' }}>{item.diemChuyenCan ?? '-'}</td>
                      <td style={{ padding: '12px' }}>{item.diemGiuaKy ?? '-'}</td>
                      <td style={{ padding: '12px' }}>{item.diemCuoiKy ?? '-'}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.diemTongKet ?? '-'}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#2563eb' }}>{item.xepLoai || '-'}</td>
                      <td style={{ padding: '12px' }}>
                        {item.daKy ? (
                          <span style={{ color: '#16a34a', fontWeight: 'bold' }}>🔒 Đã chốt & ký số</span>
                        ) : (
                          <span style={{ color: '#d97706' }}>⏳ Giảng viên chưa chốt</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default QuanLyDiemAdmin;