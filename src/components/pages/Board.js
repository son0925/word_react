import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Board() {
  const [boards, setBoards] = useState([]); // 게시판 데이터
  const [searchTitle, setSearchTitle] = useState(""); // 제목 검색어
  const [searchWriter, setSearchWriter] = useState(""); // 작성자 검색어
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지
  const [totalPages, setTotalPages] = useState(0); // 총 페이지 수
  const navigate = useNavigate(); // React Router navigate 훅

  // 게시판 데이터를 가져오는 함수
  const fetchBoards = async () => {
    try {
      const response = await axios.get("http://my-word-book.kro.kr:8080/open-api/board/list", {
        params: {
          page: currentPage,
          size: 10,
          title: searchTitle,
          writerId: searchWriter,
        },
      });
  
      const data = response.data.body;
      const pagination = response.data.pagination; // 서버의 페이지네이션 정보
  
      // 작성일 기준 내림차순 정렬 (서버가 이미 정렬한 경우 제거 가능)
      const sortedData = data.sort((a, b) => new Date(b.create_at) - new Date(a.create_at));
  
      setBoards(sortedData); // 게시글 데이터 저장
      setTotalPages(pagination.total_page); // 총 페이지 수 설정
    } catch (error) {
      console.error("게시판 데이터를 불러오는 중 오류 발생:", error);
    }
  };
  

  // 검색 버튼 클릭 핸들러
  const handleSearch = () => {
    setCurrentPage(0); // 검색 시 첫 페이지로 이동
    fetchBoards();
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // 게시글 상세 페이지로 이동하는 함수 수정
  const handleBoardClick = (boardId) => {
    navigate(`/board/detail/${boardId}`); // 해당 게시글의 상세 페이지로 이동
  };

  // 초기 데이터 로드 및 검색/페이지 변경 시 실행
  useEffect(() => {
    fetchBoards();
  }, [currentPage]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>게시판</h1>
      {/* 검색 영역 */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="제목으로 검색"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <input
          type="text"
          placeholder="작성자로 검색"
          value={searchWriter}
          onChange={(e) => setSearchWriter(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <button onClick={handleSearch} style={{ padding: "5px 10px" }}>
          검색
        </button>
        <button
          onClick={() => navigate("/board/create")}
          style={{
            padding: "5px 10px",
            marginLeft: "10px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          글 작성하기
        </button>
      </div>

      {/* 게시판 리스트 */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>작성자</th>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>제목</th>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>작성일</th>
          </tr>
        </thead>
        <tbody>
          {boards.length > 0 ? (
            boards.map((board, index) => (
              <tr
                key={board.board_id}
                onClick={() => handleBoardClick(board.board_id)} // 게시글 클릭 시 상세 페이지로 이동
                style={{ cursor: "pointer" }} // 클릭할 수 있음을 표시
              >
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {board.user_id}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {board.status === "UPDATE" ? "(수정됨) " : ""}
                  {board.title}
                </td>
                
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {new Date(board.create_at).toLocaleDateString()} {/* 작성일 표시 */}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", padding: "10px" }}>
                게시글이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 페이지네이션 */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        {[...Array(totalPages).keys()].map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            disabled={page === currentPage}
            style={{
              margin: "0 5px",
              padding: "5px 10px",
              backgroundColor: page === currentPage ? "#4CAF50" : "#fff",  // 현재 페이지는 Green
              color: page === currentPage ? "#fff" : "#333",
              cursor: page === currentPage ? "default" : "pointer",
            }}
          >
            {page + 1}
          </button>
        ))}
      </div>

    </div>
  );
}
