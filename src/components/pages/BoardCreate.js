import React, { useState } from "react";
import axios from "axios";

export default function BoardCreate() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleCreate = async () => {
    try {
      const payload = { title, content };
      await axios.post("http://my-word-book.kro.kr:8080/api/board/create", payload, {
        withCredentials: true, // 세션 정보 포함
      });
      alert("게시글이 작성되었습니다!");
      setTitle("");
      setContent("");
    } catch (error) {
      console.error("게시글 작성 오류:", error);
      alert("게시글 작성 중 오류가 발생했습니다.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>게시글 작성</h1>
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <textarea
          placeholder="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ width: "100%", height: "100px", padding: "10px" }}
        />
      </div>
      <button onClick={handleCreate} style={{ padding: "10px 20px" }}>
        작성하기
      </button>
    </div>
  );
}
