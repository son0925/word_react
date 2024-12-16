import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

axios.defaults.withCredentials = true; // CORS 문제 해결
axios.defaults.baseURL = "http://my-word-book.kro.kr:8080"; // 기본 API URL
axios.defaults.headers.common["Content-Type"] = "application/json";

export default function StatisticsGraph() {
  const [pivotData, setPivotData] = useState([]); // 피벗 테이블 데이터
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const [sortOption, setSortOption] = useState("correct_answer_count_desc"); // 기본 정렬 옵션 (정답 횟수 내림차순)

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        // 피벗 테이블 데이터 요청
        const pivotResponse = await axios.get("/api/statistics/pivot");

        if (pivotResponse.data.result.result_code === 200) {
          setPivotData(pivotResponse.data.body); // 피벗 데이터 저장
          setTotalPages(Math.ceil(pivotResponse.data.body.length / 20)); // 20개씩 페이지 나누기
        } else {
          setError(pivotResponse.data.result_description);
        }
      } catch (error) {
        console.error("데이터 가져오기 오류:", error);
        setError("서버 오류: 데이터를 가져오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  // 피벗 데이터 정렬 함수
  const handleSort = (option) => {
    setSortOption(option);

    let sortedData;
    switch (option) {
      case "correct_answer_count_desc": // 정답 횟수 내림차순
        sortedData = [...pivotData].sort((a, b) => b.correct_answer_count - a.correct_answer_count);
        break;
      case "correct_answer_count_asc": // 정답 횟수 오름차순
        sortedData = [...pivotData].sort((a, b) => a.correct_answer_count - b.correct_answer_count);
        break;
      case "incorrect_answer_count_desc": // 못 맞춘 횟수 내림차순
        sortedData = [...pivotData].sort(
          (a, b) =>
            b.total_quiz_count - b.correct_answer_count - (a.total_quiz_count - a.correct_answer_count)
        );
        break;
      case "incorrect_answer_count_asc": // 못 맞춘 횟수 오름차순
        sortedData = [...pivotData].sort(
          (a, b) =>
            a.total_quiz_count - a.correct_answer_count - (b.total_quiz_count - b.correct_answer_count)
        );
        break;
      case "total_quiz_count_desc": // 총 퀴즈 횟수 내림차순
        sortedData = [...pivotData].sort((a, b) => b.total_quiz_count - a.total_quiz_count);
        break;
      case "total_quiz_count_asc": // 총 퀴즈 횟수 오름차순
        sortedData = [...pivotData].sort((a, b) => a.total_quiz_count - b.total_quiz_count);
        break;
      case "correct_rate_desc": // 정답률 내림차순
        sortedData = [...pivotData].sort((a, b) => {
          const aRate = a.correct_answer_count / a.total_quiz_count;
          const bRate = b.correct_answer_count / b.total_quiz_count;
          return bRate - aRate;
        });
        break;
      case "correct_rate_asc": // 정답률 오름차순
        sortedData = [...pivotData].sort((a, b) => {
          const aRate = a.correct_answer_count / a.total_quiz_count;
          const bRate = b.correct_answer_count / b.total_quiz_count;
          return aRate - bRate;
        });
        break;
      default:
        sortedData = pivotData;
        break;
    }

    setPivotData(sortedData);
  };

  // 페이지 변경 처리
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const itemsPerPage = 20;
  const currentItems = pivotData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // 총 정답 횟수와 틀린 횟수 계산
  const totalCorrectAnswers = pivotData.reduce((sum, item) => sum + item.correct_answer_count, 0);
  const totalIncorrectAnswers = pivotData.reduce(
    (sum, item) => sum + (item.total_quiz_count - item.correct_answer_count),
    0
  );

  // 원형 그래프 데이터 준비
  const pieData = {
    labels: ["정답 횟수", "틀린 횟수"],
    datasets: [
      {
        data: [totalCorrectAnswers, totalIncorrectAnswers],
        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };

  // 막대 그래프 데이터 준비
  const barChartData = {
    labels: currentItems.map((item) => item.word),
    datasets: [
      {
        label: "정답 횟수",
        data: currentItems.map((item) => item.correct_answer_count),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "못 맞춘 횟수",
        data: currentItems.map((item) => item.total_quiz_count - item.correct_answer_count),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="statistics-container">
      <h2>통계 데이터</h2>

      {/* 정렬 옵션 선택 */}
      <div className="sort-options">
        <label>정렬 기준:</label>
        <select onChange={(e) => handleSort(e.target.value)} value={sortOption}>
          <option value="correct_answer_count_desc">정답 횟수 높은 순</option>
          <option value="correct_answer_count_asc">정답 횟수 낮은 순</option>
          <option value="incorrect_answer_count_desc">못 맞춘 횟수 높은 순</option>
          <option value="incorrect_answer_count_asc">못 맞춘 횟수 낮은 순</option>
          <option value="total_quiz_count_desc">총 퀴즈 횟수 높은 순</option>
          <option value="total_quiz_count_asc">총 퀴즈 횟수 낮은 순</option>
          <option value="correct_rate_desc">정답률 높은 순</option>
          <option value="correct_rate_asc">정답률 낮은 순</option>
        </select>
      </div>

      {/* 상위 20개 피벗 테이블 렌더링 */}
      <div className="pivot-table">
        <h3>피벗 테이블</h3>
        {currentItems.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>단어</th>
                <th>정답 횟수</th>
                <th>못 맞춘 횟수</th>
                <th>총 퀴즈 횟수</th>
                <th>정답률</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((row, index) => (
                <tr key={index}>
                  <td>{row.word}</td>
                  <td>{row.correct_answer_count}</td>
                  <td>{row.total_quiz_count - row.correct_answer_count}</td>
                  <td>{row.total_quiz_count}</td>
                  <td>
                    {row.total_quiz_count > 0
                      ? ((row.correct_answer_count / row.total_quiz_count) * 100).toFixed(2)
                      : 0}
                    %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>피벗 데이터를 불러올 수 없습니다.</div>
        )}
      </div>

      {/* 페이지 네비게이션 */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={currentPage === page ? "active" : ""}
          >
            {page}
          </button>
        ))}
      </div>

      {/* 차트 렌더링 */}
      <div className="chart-container">
        <h3>현재 페이지 데이터 그래프</h3>
        <Bar
          data={barChartData}
          options={{ responsive: true, plugins: { legend: { position: "top" } } }}
        />
      </div>

      {/* 원형 그래프 렌더링 */}
      <div className="pie-chart-container">
        <h3>전체 정답/틀린 횟수 비율</h3>
        <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
      </div>
    </div>
  );
}
