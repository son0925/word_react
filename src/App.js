import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/index.css'; // 전체 스타일
import Home from './components/pages/Home';
import BoardCreate from './components/pages/BoardCreate';
import BoardUpdate from './components/pages/BoardUpdate';
import BoardDetail from './components/pages/BoardDetail';
import Footer from './components/Footer';
import Login from './components/Login';
import Signup from './components/Signup';
import WordAdd from './components/pages/WordAdd';
import WordList from './components/pages/WordList';
import WordQuiz from './components/pages/WordQuiz';
import Board from './components/pages/Board';
import MainMenuBar from './components/MainMenuBar';
import './styles/App.css';
import Profile from './components/pages/Profile';
import ChangePassword from './components/pages/ChangePassword';
import StatisticsGraph from './components/pages/StatisticsGraph';

export default function App() {
  return (
    <Router>
      {/* 상단 메뉴바 */}
      <MainMenuBar />
      
      {/* 메인 콘텐츠 */}
      <div className="main-content">
        <Routes>
          {/* 홈 화면 */}
          <Route path="/" element={<Home />} />
          {/* 로그인, 회원가입 페이지 */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* 단어 관련 페이지 */}
          <Route path="/word-add" element={<WordAdd />} />
          <Route path="/word-list" element={<WordList />} />
          <Route path="/word-quiz" element={<WordQuiz />} />
          
          <Route path="/board" element={<Board />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/statistics" element={<StatisticsGraph />} />

          <Route path="/board/create" element={<BoardCreate />} />
          <Route path="/board/detail/:boardId" element={<BoardDetail />} />
          <Route path="/board/update/:boardId" element={<BoardUpdate />} />
        </Routes>
      </div>
      
      {/* 하단 푸터 */}
      <Footer />
    </Router>
  );
}
