import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function BoardDetail() {
  const { boardId } = useParams(); // URL에서 boardId를 추출
  const [board, setBoard] = useState(null); // 게시글 상세 정보
  const [replies, setReplies] = useState([]); // 답글 리스트
  const [replyContent, setReplyContent] = useState(""); // 새 답글 내용
  const [isAuthorOrAdmin, setIsAuthorOrAdmin] = useState(false); // 작성자 또는 관리자 여부
  const navigate = useNavigate(); // 페이지 이동을 위한 navigate 함수

  // 방문 기록을 서버에 전송하는 함수
  const sendVisitRecord = async () => {
    try {
      await axios.post(
        `http://my-word-book.kro.kr:8080/api/board/visit/${boardId}`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("방문 기록 전송 중 오류 발생:", error);
    }
  };

  // 현재 로그인된 사용자 정보 (예: userId, role 등을 얻는 API 호출)
  const fetchUserInfo = async () => {
    try {
      const response = await axios.get("http://my-word-book.kro.kr:8080/api/user/info", { withCredentials: true });
      return response.data.body; // 로그인된 사용자 정보 반환
    } catch (error) {
      console.error("사용자 정보를 불러오는 중 오류 발생:", error);
    }
  };

  // 게시글 상세 정보와 사용자 정보 불러오기
  useEffect(() => {
    // 이미 방문한 게시글인지 확인 (localStorage 사용)
    const visitedPosts = JSON.parse(localStorage.getItem("visitedPosts")) || [];
    if (!visitedPosts.includes(boardId)) {
      sendVisitRecord(); // 방문 기록을 서버에 전송
      visitedPosts.push(boardId); // 방문한 게시글 ID 추가
      localStorage.setItem("visitedPosts", JSON.stringify(visitedPosts)); // 로컬스토리지에 저장
    }

    // 게시글 상세 정보 불러오기
    const fetchBoardDetail = async () => {
      try {
        const boardResponse = await axios.get(`http://my-word-book.kro.kr:8080/open-api/board/detail/${boardId}`);
        setBoard(boardResponse.data.body); // 응답 데이터로 게시글 상세 정보를 설정

        const userResponse = await fetchUserInfo(); // 로그인된 사용자 정보 가져오기
        const isAdmin = userResponse.role === "ADMIN"; // 관리자 여부
        const isAuthor = userResponse.user_id === boardResponse.data.body.user_id; // 게시글 작성자 여부

        // 작성자 또는 관리자일 때 수정, 삭제 버튼을 활성화
        setIsAuthorOrAdmin(isAdmin || isAuthor);

        // 답글 목록 불러오기
        console.log(boardResponse.data.body);
        const fetchedReplies = boardResponse.data.body.replies_list || [];
        setReplies(fetchedReplies); // 응답 데이터에서 답글 목록 설정
      } catch (error) {
        console.error("게시글을 불러오는 중 오류 발생:", error);
      }
    };

    fetchBoardDetail();
  }, [boardId]); // boardId가 바뀔 때마다 실행되도록 설정

  // 게시글 삭제 처리
  const handleDelete = async () => {
    try {
      await axios.delete(`http://my-word-book.kro.kr:8080/api/board/delete/${boardId}`, { withCredentials: true });
      alert("게시글이 삭제되었습니다.");
      navigate("/board/list"); // 게시글 삭제 후 목록 페이지로 이동
    } catch (error) {
      console.error("게시글 삭제 오류:", error);
      alert("게시글 삭제 중 오류가 발생했습니다.");
    }
  };

  // 게시글 수정 페이지로 이동
  const handleEdit = () => {
    navigate(`/board/update/${boardId}`);
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) {
      alert("답글 내용을 입력해주세요.");
      return;
    }

    try {
      // 서버에 답글 전송
      const response = await axios.post(
        `http://my-word-book.kro.kr:8080/api/reply/create`,
        {
          board_id: boardId, // 게시글 ID
          comment: replyContent, // 답글 내용
        },
        { withCredentials: true }
      );

      // 새 답글을 prevReplies를 펼친 후 추가하는 방식으로 처리
      setReplies((prevReplies) => {
        if (Array.isArray(prevReplies)) {
          return [...prevReplies, response.data.body]; // prevReplies가 배열일 때만 spread
        } else {
          return [response.data.body]; // 만약 prevReplies가 비어있다면 새로운 배열을 리턴
        }
      });

      setReplyContent(""); // 입력란 초기화
    } catch (error) {
      console.error("답글 작성 중 오류 발생:", error);
      alert("답글 작성 중 오류가 발생했습니다.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {board ? (
        <>
          <h1>{board.title}</h1>
          <p><strong>작성자:</strong> {board.user_id}</p>
          <p><strong>작성일:</strong> {new Date(board.create_at).toLocaleString()}</p>
          <p><strong>조회수:</strong> {board.visit_count}</p> {/* 조회수 표시 */}

          <div>
            <h3>내용:</h3>
            <p>{board.content}</p>
          </div>

          {/* 수정, 삭제 버튼 */}
          {isAuthorOrAdmin && (
            <div style={{ marginTop: "20px" }}>
              <button onClick={handleEdit} style={{ padding: "10px 20px", marginRight: "10px" }}>
                수정
              </button>
              <button onClick={handleDelete} style={{ padding: "10px 20px", backgroundColor: "red", color: "white" }}>
                삭제
              </button>
            </div>
          )}

          {/* 답글 리스트 */}
          <div style={{ marginTop: "30px" }}>
            <h2>답글</h2>
            {replies.length > 0 ? (
              <ul style={{ listStyleType: "none", paddingLeft: "0" }}>
                {replies.map((reply, index) => (
                  reply && reply.user_id ? ( // Check if reply and reply.user_id exist
                    <li key={reply.reply_id || index} style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                      <p><strong>{reply.user_id || "알 수 없음"}</strong> - {new Date(reply.create_at).toLocaleString()}</p>
                      <p>{reply.content}</p>
                    </li>
                  ) : (
                    <li key={index}>답글 정보가 불완전합니다.</li> // Handle incomplete reply data
                  )
                ))}
              </ul>
            ) : (
              <p>답글이 없습니다.</p>
            )}
          </div>

          {/* 답글 작성 폼 */}
          <div style={{ marginTop: "20px" }}>
            <h3>답글 작성</h3>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="답글을 작성하세요..."
              rows="4"
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
            <div style={{ marginTop: "10px" }}>
              <button onClick={handleReplySubmit} style={{ padding: "10px 20px", backgroundColor: "#4CAF50", color: "#fff" }}>
                답글 작성
              </button>
            </div>
          </div>
        </>
      ) : (
        <p>게시글을 불러오는 중입니다...</p>
      )}
    </div>
  );
}
