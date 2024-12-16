// Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const loginData = {
      user_id: userId,
      password: password,
    };

    try {
      const response = await fetch('http://my-word-book.kro.kr:8080/open-api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: loginData }),
        credentials: 'include', // 쿠키를 포함시켜서 서버와 주고받기
      });

      const data = await response.json();
      
      if (data.result.result_code === 200) {
        // 서버에서 쿠키를 설정했다면, 클라이언트에서 쿠키를 사용할 수 있습니다.
        alert('로그인 성공');
        navigate('/'); // 홈으로 리디렉션
        window.location.reload(); // 상태 즉시 반영을 위해 페이지 새로고침
      } else {
        alert(`로그인 실패: ${data.result.result_description}`);
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      alert('서버 오류');
    }
  };

  return (
    <div className="login-container">
      <h2>로그인</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="userId">아이디</label>
          <input
            type="text"
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">로그인</button>
        <div>
          <p>계정이 없으신가요? <a href="/signup">회원가입</a></p>
        </div>
      </form>
    </div>
  );
}
