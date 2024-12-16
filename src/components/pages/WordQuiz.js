import React, { useState, useEffect } from "react";
import axios from "axios";

// 폭죽 애니메이션 스타일 추가
const fireworkStyle = {
  position: "absolute",
  width: "20px",
  height: "20px",
  borderRadius: "50%",
  backgroundColor: "yellow",
  animation: "firework 1s ease-in-out forwards",
};

const styles = {
  fireworkContainer: {
    position: "relative",
    height: "300px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "20px",
  },
};

// 폭죽 애니메이션
const keyframes = `
  @keyframes firework {
    0% {
      transform: scale(0) translate(0, 0);
      opacity: 1;
    }
    50% {
      transform: scale(1.5) translate(-50px, -50px);
      opacity: 0.7;
    }
    100% {
      transform: scale(3) translate(50px, 50px);
      opacity: 0;
    }
  }
`;

const Fireworks = () => {
  const fireworks = [];
  for (let i = 0; i < 5; i++) {
    fireworks.push(<div key={i} style={fireworkStyle}></div>);
  }
  return (
    <div style={styles.fireworkContainer}>
      {fireworks}
      <style>{keyframes}</style> {/* 폭죽 애니메이션 CSS 삽입 */}
    </div>
  );
};

export default function WordQuiz() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [incorrectAnswers, setIncorrectAnswers] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(20);
  const [showMemo, setShowMemo] = useState(false);

  // 배열을 랜덤 섞기
  const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

  // 퀴즈 시작
  const handleStartQuiz = async () => {
    try {
      const response = await axios.get("http://my-word-book.kro.kr:8080/word/quiz", {
        params: { size: totalQuestions },
        headers: {
          "authorization-token": localStorage.getItem("token"),
        },
        withCredentials: true,
      });
      const shuffledQuestions = shuffleArray(response.data.body || []);
      setQuestions(shuffledQuestions);
      setQuizStarted(true);
    } catch (err) {
      console.error("퀴즈 시작 오류:", err);
      alert("퀴즈 데이터를 불러오는 중 오류가 발생했습니다.");
    }
  };

  // 답안 제출 처리
  const handleAnswerSubmit = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const trimmedUserAnswer = userAnswer.trim().toLowerCase();
    const trimmedCorrectAnswer = currentQuestion.word.trim().toLowerCase();

    if (trimmedUserAnswer === trimmedCorrectAnswer) {
      setCorrectAnswers((prev) => [...prev, currentQuestion]);
    } else {
      setIncorrectAnswers((prev) => [
        ...prev,
        { ...currentQuestion, userAnswer }, // 사용자의 입력을 추가
      ]);
    }

    // 다음 질문으로 이동 또는 퀴즈 종료
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
    setUserAnswer(""); // 입력 필드 초기화
  };

  // 퀴즈 재시작
  const handleRestartQuiz = () => {
    setQuizStarted(false);
    setQuizFinished(false);
    setCurrentQuestionIndex(0);
    setUserAnswer("");
    setCorrectAnswers([]);
    setIncorrectAnswers([]);
    setShowMemo(false);
  };

  // 결과 서버로 전송
  const sendResults = async () => {
    const correctResults = correctAnswers.map((item) => ({
      word_id: item.word_id,
      status: "ANSWER",
    }));
    const incorrectResults = incorrectAnswers.map((item) => ({
      word_id: item.word_id,
      status: "WRONG_ANSWER",
    }));

    const results = [...correctResults, ...incorrectResults];

    try {
      await axios.put("http://my-word-book.kro.kr:8080/api/statistics/result", results, {
        withCredentials: true,
      });
      console.log("결과가 서버로 전송되었습니다.");
    } catch (err) {
      console.error("결과 전송 오류:", err);
      alert("결과 전송 중 문제가 발생했습니다.");
    }
  };

  // 퀴즈 완료 시 결과 전송
  useEffect(() => {
    if (quizFinished) {
      sendResults();
    }
  }, [quizFinished]);

  // 엔터 키로 답안 제출
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAnswerSubmit();
    }
  };

  // 퀴즈 종료 화면
  if (quizFinished) {
    const allCorrect = incorrectAnswers.length === 0;

    return (
      <div>
        {allCorrect ? (
          <div>
            <h2>축하합니다! 모든 문제를 맞추셨습니다!</h2>
            <Fireworks /> {/* 폭죽 애니메이션 컴포넌트 */}
          </div>
        ) : (
          <div>
            <h2>퀴즈 종료</h2>
            <p>틀린 단어: {incorrectAnswers.length}</p>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ddd", padding: "8px", backgroundColor: "#f2f2f2" }}>뜻</th>
                  <th style={{ border: "1px solid #ddd", padding: "8px", backgroundColor: "#f2f2f2" }}>정답</th>
                  <th style={{ border: "1px solid #ddd", padding: "8px", backgroundColor: "#f2f2f2" }}>내가 쓴 답</th>
                </tr>
              </thead>
              <tbody>
                {incorrectAnswers.map((item) => (
                  <tr key={item.word_id}>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{item.mean}</td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{item.word}</td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {item.userAnswer || <span style={{ color: "red" }}>미입력</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleRestartQuiz}>다시하기</button>
          </div>
        )}
      </div>
    );
  }

  // 퀴즈 시작 화면
  if (!quizStarted) {
    return (
      <div>
        <h1>단어 퀴즈</h1>
        <label>문제 수: </label>
        <input
          type="number"
          value={totalQuestions}
          onChange={(e) => setTotalQuestions(Number(e.target.value))}
          min="1"
          max="100"
        />
        <button onClick={handleStartQuiz}>단어 퀴즈 시작</button>
      </div>
    );
  }

  // 현재 질문
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div>
      <h2>퀴즈 문제 {currentQuestionIndex + 1} / {questions.length}</h2>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p>
          <strong>뜻:</strong> {currentQuestion.mean}
        </p>
        {currentQuestion.memo && (
          <button onClick={() => setShowMemo(!showMemo)}>
            {showMemo ? "메모 숨기기" : "메모 보기"}
          </button>
        )}
      </div>
      {showMemo && currentQuestion.memo && (
        <p>
          <strong>메모:</strong> {currentQuestion.memo}
        </p>
      )}

      <div>
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="단어를 입력하세요"
          onKeyDown={handleKeyDown}
        />
      </div>

      <div>
        <button onClick={handleAnswerSubmit} disabled={!userAnswer}>
          다음 문제
        </button>
      </div>
    </div>
  );
}
