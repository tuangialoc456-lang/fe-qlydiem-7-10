import React, { useState, useEffect } from 'react';
import { tokenAPI } from '../services/api';

export default function OtpModal({ isOpen, onClose, userEmail, onSuccess }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      handleSendOtp();
    } else {
      setOtp('');
      setError('');
      setMessage('');
    }
  }, [isOpen]);

  const handleSendOtp = async () => {
    setSendingOtp(true);
    setError('');
    setMessage('');
    try {
      await tokenAPI.requestOtp();
      setMessage(`Mã OTP đã được gửi tới email: ${userEmail || 'giảng viên'}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi mã OTP qua Gmail.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyAndDownload = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Vui lòng nhập đủ 6 chữ số OTP.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await tokenAPI.verifyOtpAndGenerate(otp);

      const blob = new Blob([response.data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lecturer-token-${Date.now()}.key`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      if (onSuccess) onSuccess('Cấp mới & tải File Token (.key) thành công!');
      onClose();
    } catch (err) {
      if (err.response && err.response.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const json = JSON.parse(text);
          setError(json.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
        } catch {
          setError('Xác thực OTP thất bại.');
        }
      } else {
        setError(err.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>🔑 Xác nhận OTP cấp Token</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleVerifyAndDownload} className="modal-body">
          <p className="modal-description">
            Hệ thống đã gửi 1 mã OTP 6 chữ số tới Gmail của tài khoản:
            <br />
            <strong style={{ color: '#1677ff' }}>{userEmail}</strong>
          </p>

          {message && <div className="alert-box alert-info">{message}</div>}
          {error && <div className="alert-box alert-error">{error}</div>}

          <div className="form-group" style={{ marginTop: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Nhập mã OTP (6 chữ số):</label>
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              style={{
                letterSpacing: '8px',
                fontSize: '22px',
                textAlign: 'center',
                padding: '10px',
                width: '100%',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
          </div>

          <div style={{ textAlign: 'right', marginTop: '8px' }}>
            <button
              type="button"
              className="btn-link"
              onClick={handleSendOtp}
              disabled={sendingOtp}
              style={{ background: 'none', border: 'none', color: '#1677ff', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {sendingOtp ? 'Đang gửi lại OTP...' : 'Gửi lại mã OTP'}
            </button>
          </div>

          <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || otp.length !== 6}>
              {loading ? 'Đang xác thực...' : 'Xác nhận & Tải File Token (.key)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}