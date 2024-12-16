import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // axios로 서버와 통신
import '../styles/MainMenuBar.css';

axios.defaults.withCredentials = true;

export default function MainMenuBar() {
  const [user, setUser] = useState(null); // 사용자 정보 상태
  const navigate = useNavigate();

  // 사용자 정보 가져오기
  const fetchUserInfo = async () => {
    try {
      const response = await axios.get('http://my-word-book.kro.kr:8080/api/user/info');
      setUser({ userId: response.data.body.user_id }); // 사용자 정보 업데이트
    } catch (error) {
      console.error('사용자 정보 불러오기 실패:', error);
      setUser(null); // 인증 실패 시 사용자 정보 초기화
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await axios.post('http://my-word-book.kro.kr:8080/api/user/logout', {}, {});
      setUser(null); // 사용자 정보 초기화
      navigate('/'); // 로그아웃 후 메인으로 리디렉션
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <header className="main-menu-bar">
      <div className="logo-container">
        {/* 로고 클릭 시 메인 메뉴로 이동 */}
        <Link to="/">
          <img src="/imgs/MyLogo.png" alt="MyLogo" className="logo-image" />
        </Link>
      </div>
      <nav className="nav-container">
        {/* 단어 관련 링크 */}
        <ul className="left-links">
          <li><Link to="/word-add">단어 추가</Link></li>
          <li><Link to="/word-list">단어 리스트</Link></li>
          <li><Link to="/word-quiz">단어 퀴즈</Link></li>
          <li><Link to="/board">게시판</Link></li>
        </ul>

        {/* 로그인 상태에 따른 링크 */}
        <ul className="right-links">
          {!user ? (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/signup">Sign Up</Link></li>
            </>
          ) : (
            <li>
              {/* "내 이름" 클릭 시 /profile 페이지로 이동 */}
              <Link to="/profile">{user.userId}님 반갑습니다.</Link>
              <a href="#" onClick={handleLogout}>로그아웃</a>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
