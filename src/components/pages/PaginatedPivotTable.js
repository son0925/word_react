import React, { useState, useEffect } from "react";
import axios from "axios";

export default function PaginatedPivotTable() {
  const [pivotData, setPivotData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPivotData = async () => {
      try {
        const response = await axios.get("http://my-word-book.kro.kr:8080/api/statistics/pivot");

        if (response.data.result.result_code === 200) {
          setPivotData(response.data.body);
          setTotalPages(Math.ceil(response.data.body.length / 20)); // 20개씩 페이지 나누기
        } else {
          setError(response.data.result_description);
        }
      } catch (error) {
        console.error("데이터 가져오기 오류:", error);
        setError("서버 오류: 데이터를 가져오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPivotData();
  }, []);

  const itemsPerPage = 20;
  const currentItems = pivotData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="pivot-table-container">
      <h2>피벗 테이블</h2>

      {/* 피벗 테이블 렌더링 */}
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
    </div>
  );
}
