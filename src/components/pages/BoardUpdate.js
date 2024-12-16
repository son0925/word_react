import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function BoardEdit() {
  const location = useLocation();
  const navigate = useNavigate();
  const { boardId } = useParams(); // URL에서 boardId 가져오기

  // 전달받은 데이터가 없을 경우를 대비해 기본값 설정
  const [formData, setFormData] = useState({
    title: location.state?.board?.title || "", // location.state가 없으면 빈 문자열
    content: location.state?.board?.content || "",
  });

  // 서버에서 데이터를 가져오는 함수 (URL 직접 입력 시 대비)
  const fetchBoardDetail = async () => {
    try {
      const response = await axios.get(`http://my-word-book.kro.kr:8080/open-api/board/detail/${boardId}`);
      const board = response.data.body;
      setFormData({
        title: board.title,
        content: board.content,
      });
    } catch (error) {
      console.error("게시글을 불러오는 중 오류 발생:", error);
      alert("게시글 데이터를 가져오지 못했습니다.");
      navigate("/board/list"); // 데이터를 가져오지 못하면 목록 페이지로 이동
    }
  };

  // 컴포넌트가 처음 렌더링될 때 서버에서 데이터 로드
  useEffect(() => {
    if (!location.state?.board) {
      fetchBoardDetail(); // state에 데이터가 없으면 서버에서 데이터 가져오기
    }
  }, [location.state, boardId]);

  // 입력값 변경 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://my-word-book.kro.kr:8080/api/board/update`, // 수정 엔드포인트로 데이터 전송
        {
          board_id: boardId,
          title: formData.title,
          content: formData.content,
        },
        { withCredentials: true }
      );
      alert("게시글이 수정되었습니다.");
      navigate(`/board/detail/${boardId}`); // 수정 후 상세보기 페이지로 이동
    } catch (error) {
      console.error("게시글 수정 중 오류 발생:", error);
      alert("게시글 수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>게시글 수정</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>제목:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            style={{ width: "100%", padding: "10px", marginBottom: "20px" }}
          />
        </div>
        <div>
          <label>내용:</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            style={{ width: "100%", height: "200px", padding: "10px" }}
          />
        </div>
        <button type="submit" style={{ padding: "10px 20px", marginTop: "20px" }}>
          저장
        </button>
      </form>
    </div>
  );
}
