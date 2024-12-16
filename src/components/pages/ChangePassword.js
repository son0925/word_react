import React, { useState } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true; // CORS 문제 해결
axios.defaults.baseURL = 'http://my-word-book.kro.kr:8080'; // 기본 API URL
axios.defaults.headers.common['Content-Type'] = 'application/json'; // 기본 헤더 설정

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState(''); // 현재 비밀번호
  const [newPassword, setNewPassword] = useState(''); // 새 비밀번호
  const [confirmPassword, setConfirmPassword] = useState(''); // 새 비밀번호 확인
  const [loading, setLoading] = useState(false); // 로딩 상태

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // 비밀번호 확인
    if (newPassword !== confirmPassword) {
      alert('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      const body = {
        current_password: currentPassword,
        change_password: newPassword,
      };

      // 비밀번호 변경 요청
      const response = await axios.post('/api/user/change-password', {body: body});

      setLoading(false);

      if (response.data.result.result_code === 200) {
        alert('비밀번호가 성공적으로 변경되었습니다.');
        // 폼 초기화
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        alert('비밀번호 변경 실패: ' + response.data.result.result_description);
      }
    } catch (error) {
      setLoading(false);
      console.error('비밀번호 변경 오류:', error);
      alert('서버 오류로 인해 비밀번호를 변경할 수 없습니다.');
    }
  };

  return (
    <div className="change-password-container">
      <h2>비밀번호 변경</h2>
      <form onSubmit={handlePasswordChange}>
        {/* 현재 비밀번호 입력 */}
        <div className="form-group">
          <label htmlFor="currentPassword">현재 비밀번호</label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>

        {/* 새 비밀번호 입력 */}
        <div className="form-group">
          <label htmlFor="newPassword">새 비밀번호</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        {/* 새 비밀번호 확인 입력 */}
        <div className="form-group">
          <label htmlFor="confirmPassword">새 비밀번호 확인</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {/* 제출 버튼 */}
        <button type="submit" disabled={loading}>
          {loading ? '변경 중...' : '비밀번호 변경'}
        </button>
      </form>
    </div>
  );
}
