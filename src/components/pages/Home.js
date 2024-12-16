import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Axios 추가

export default function Home() {
  const [user, setUser] = useState(null);

  // 서버에서 사용자 정보를 가져오는 함수
  const fetchUserInfo = async () => {
    try {
      const response = await axios.get('/api/user/info', {
        withCredentials: true, // 인증 쿠키 포함
      });

      // API 응답 결과 처리
      if (response.data.result.result_code === 200) {
        console.log(response.data.body.name);
        setUser(response.data.body.name); // API 응답에서 `body`에 사용자 정보가 있음
      } else {
        console.error('사용자 정보를 가져오지 못했습니다.');
        setUser(null); // 실패 시 user를 null로 설정
      }
    } catch (error) {
      console.error('오류 발생:', error);
      setUser(null);
    }
  };

  // 컴포넌트가 마운트될 때 사용자 정보 가져오기
  useEffect(() => {
    fetchUserInfo();
  }, []);

  // 로그인하지 않은 경우
  if (!user) {
    return (
      <div>
        {/* 공지사항 / 광고 배너 */}
        <div style={{ backgroundColor: '#ffeb3b', padding: '10px', textAlign: 'center' }}>
          <strong>🎉 이벤트 안내!</strong> 새로운 퀴즈 모드가 추가되었습니다. 지금 확인하세요!
        </div>

        {/* 퀴즈 소개 */}
        <h2>단어 퀴즈란?</h2>
        <p>이 퀴즈는 여러분이 추가한 단어들을 맞히는 게임입니다. 재미있게 학습할 수 있습니다!</p>
        <button onClick={() => window.location.href = '/login'}>로그인</button>
      </div>
    );
  }

  // 로그인된 경우
  return (
    <div>
      {/* 공지사항 / 광고 배너 */}
      <div style={{ backgroundColor: '#ffeb3b', padding: '10px', textAlign: 'center' }}>
        <strong>🎉 이벤트 안내!</strong> 새로운 퀴즈 모드가 추가되었습니다. 지금 확인하세요!
      </div>

      {/* 환영 메시지 */}
      <h1>환영합니다, {user}님!</h1>
      <p>단어 퀴즈 프로젝트에 오신 것을 환영합니다. 아래에서 시작하세요!</p>
      
      {/* 시작하기 */}
      <h2>시작하기</h2>
      <ul>
        <li><a href="/word-add">단어 추가</a> - 새로운 단어를 추가하여 퀴즈에 포함시킬 수 있습니다.</li>
        <li><a href="/word-list">단어 리스트</a> - 이미 추가된 단어들을 확인할 수 있습니다.</li>
        <li><a href="/word-quiz">퀴즈 시작</a> - 퀴즈를 시작하고 단어를 맞춰보세요!</li>
      </ul>
      
      {/* 통계 또는 진행 상태 */}
      <h2>주요 품사 약어</h2>
      <p>v : verb (동사) 행동, 상태, 또는 작용을 나타내는 단어. (run, speak, be, have)</p>
      <p>n : Noun (명사) 사람, 장소, 사물, 아이디어 등을 나타내는 단어. (book, dog, happiness)</p>
      <p>adj : Adjective (형용사) 명사를 수식하거나 설명하는 단어. (beautiful, fast, happy)</p>
      <p>adv : Adverb (부사) 동사, 형용사, 또는 다른 부사를 수식하는 단어. (quickly, very, well)</p>
      <p>prep : Preposition (전치사) 명사 또는 대명사와 함께 쓰여 관계를 나타냄. (in, on, at)</p>
      <p>conj : Conjunction (접속사) 단어, 구, 문장을 연결하는 단어. (and, but, because)</p>
      <p>pron : Pronoun (대명사) 명사를 대신하는 단어. (he, she, it, they)</p>

      {/* 광고 배너 */}
      <div style={{ backgroundColor: '#2196f3', color: 'white', padding: '10px', textAlign: 'center' }}>
        <strong>💡 새로운 기능 출시!</strong> 퀴즈를 풀 때 본인의 정답률이 낮은 단어가 나옵니다.
      </div>
      
      {/* 퀴즈 소개 */}
      <h2>단어 퀴즈 알고리즘</h2>
      <p>1. 한 번도 퀴즈를 하지 않은 단어가 나옵니다.</p>
      <p>2. 마지막 퀴즈에서 틀린 단어가 나옵니다.</p>
      <p>3. 퀴즈에 연속 5번 이상 나오지 않은 단어가 나옵니다.</p>
      <p>4. 정답률이 저조한 단어가 나옵니다.</p>
      <button onClick={() => window.location.href = '/word-quiz'}>퀴즈 시작하기</button>
    </div>
  );
}
