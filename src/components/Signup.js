import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [userId, setUserId] = useState(''); // userId (아이디)
  const [password, setPassword] = useState(''); // password (비밀번호)
  const [confirmPassword, setConfirmPassword] = useState(''); // 비밀번호 확인
  const [name, setName] = useState(''); // name (이름)
  const [birthdate, setBirthdate] = useState(''); // birthdate (생일)
  const [isUserIdChecked, setIsUserIdChecked] = useState(false); // 아이디 중복 체크 여부
  const [userIdError, setUserIdError] = useState(''); // 아이디 중복 오류 메시지
  const navigate = useNavigate();

  // 아이디 중복 체크 함수
  const handleUserIdCheck = async () => {
    try {
      const response = await fetch('http://my-word-book.kro.kr:8080/open-api/user/existentID', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body : {user_id : userId} }),
      });

      const data = await response.json();

      if (data.result.result_code === 200) {
        setUserIdError('아이디가 사용 가능합니다.');
        setIsUserIdChecked(true); // 중복 확인 완료
      } else {
        setUserIdError(`아이디 중복: ${data.result.result_description}`);
        setIsUserIdChecked(false); // 중복된 아이디일 경우 false
      }
    } catch (error) {
      console.error('아이디 중복 확인 오류:', error);
      setUserIdError('서버 오류');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 아이디 중복 확인을 하지 않으면 제출할 수 없도록
    if (!isUserIdChecked) {
      alert('아이디 중복 확인을 해주세요.');
      return;
    }

    // 비밀번호와 비밀번호 확인이 일치하는지 체크
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 회원가입 데이터 (사용자 입력 값 사용)
    const registerData = {
      user_id: userId, // userId로 수정
      password: password,
      name: name,
      birthdate: birthdate, // 생일 추가
    };

    try {
      const response = await fetch('http://my-word-book.kro.kr:8080/open-api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: registerData }), // API 요청 데이터 포맷에 맞춰서 보내기
      });

      // 응답이 성공적인지 확인
      const data = await response.json();
      
      // 응답이 API 형식에 맞는지 확인하고 처리
      if (data.result.result_code === 200) {
        alert('회원가입 성공');
        navigate('/login'); // 회원가입 후 로그인 화면으로 리디렉션
      } else {
        alert(`회원가입 실패: ${data.result.result_description}`);
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      alert('서버 오류');
    }
  };

  return (
    <div className="signup-container">
      <h2>회원가입</h2>
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
          {/* 아이디 중복 확인 버튼 */}
          <button type="button" onClick={handleUserIdCheck} disabled={!userId}>
            아이디 중복 확인
          </button>
          {userIdError && <p>{userIdError}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="name">이름</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="birthdate">생일</label>
          <input
            type="date"
            id="birthdate"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
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
        <div className="form-group">
          <label htmlFor="confirmPassword">비밀번호 확인</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="signup-button">회원가입</button>
        <div>
          <p>계정이 있으신가요? <a href="/login">로그인</a></p>
        </div>
      </form>
    </div>
  );
}
