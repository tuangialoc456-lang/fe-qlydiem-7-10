import React, { useState } from 'react';
import axios from 'axios';

export default function OtpTokenModal({ isOpen, onClose, userEmail }) {
  const [step, setStep] = useState(1); // 1: Yêu cầu gửi OTP, 2: Nhập mã OTP
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Gọi API yêu cầu gửi OTP về Gmail
  const handleRequestOtp = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await axios.post('/api/token/request-otp', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStep(2);
      setSuccessMsg(`Mã OTP đã được gửi đến email ${userEmail}`);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Không thể gửi mã OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Gọi API kiểm tra OTP và tải xuống file .key
  const handleVerifyAndDownload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await axios.post(
        '/api/token/verify-and-generate',
        { otp },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          responseType: 'blob' // Bắt buộc để nhận dữ liệu nhị phân của file
        }
      );

      // Tự động kích hoạt tải xuống file .key
      const blob = new Blob([response.data], { type: 'application/octet-stream' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `token_${Date.now()}.key`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      onClose();
    } catch (err) {
      setErrorMsg('Mã OTP không đúng hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h4 style={{ marginTop: 0 }}>Xác thực cấp lại Token nhập điểm</h4>
        
        {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
        {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}

        {step === 1 ? (
          <div>
            <p>Mã OTP xác nhận sẽ được gửi về Gmail của tài khoản đang đăng nhập:</p>
            <p><b>{userEmail}</b></p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button onClick={onClose} disabled={loading}>Hủy</button>
              <button onClick={handleRequestOtp} disabled={loading}>
                {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleVerifyAndDownload}>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              Nhập mã OTP (6 chữ số):
            </label>
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              placeholder="Nhập mã OTP..."
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="button" onClick={onClose} disabled={loading}>Hủy</button>
              <button type="submit" disabled={loading}>
                {loading ? 'Đang kiểm tra...' : 'Xác nhận & Tải File .key'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
  justifyContent: 'center', alignItems: 'center', zIndex: 1000
};

const modalContentStyle = {
  background: '#fff', padding: '24px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
};