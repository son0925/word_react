import React, { useState, useRef } from "react";
import axios from "axios";

export default function WordAdd() {
  const [word, setWord] = useState("");
  const [mean, setMean] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);

  const wordInputRef = useRef(null);

  // HTML 태그 제거 함수
  const cleanHtmlTags = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  // 단어 추가 요청
  const handleSubmit = async (e) => {
    e.preventDefault();

    const wordData = {
      word: word,
      mean: mean,
      memo: memo,
    };

    try {
      const response = await axios.post("http://my-word-book.kro.kr:8080/word/add", {
        body: wordData,
      });

      const data = response.data;
      console.log(data);

      if (data.result.result_code === 200) {
        alert("단어가 성공적으로 추가되었습니다.");
        setWord("");
        setMean("");
        setMemo("");
        setSearchResults([]);
        wordInputRef.current.focus();
      } else {
        alert(`단어 추가 실패: ${data.result.result_description}`);
      }
    } catch (error) {
      console.error("단어 추가 오류:", error);
      alert("서버 오류");
    }
  };

  // 사전 검색 요청
  const handleDictionarySearch = async () => {
    if (!word.trim()) {
      alert("단어를 입력하세요.");
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      const response = await axios.post(
        `http://my-word-book.kro.kr:8080/word/search-dictionary?word=${encodeURIComponent(word)}`
      );
    
      const data = response.data;
      console.log(data);
    
      if (data.result.result_code === 200 && data.body && data.body.length > 0) {
        const cleanedResults = data.body.map((result) => ({
          ...result,
          title: cleanHtmlTags(result.title),
          description: cleanHtmlTags(result.description),
        }));
        setSearchResults(cleanedResults.slice(0, 3));
      } else {
        setError("단어를 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("사전 검색 오류:", error);
      setError("사전 검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
    
  };

  // 검색 결과 선택
  const handleSelectMeaning = (description, index) => {
    setMemo(description);
    setSelectedResult(index);
  };

  return (
    <div className="container">
      <h1>단어 추가</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="word">단어</label>
          <input
            type="text"
            id="word"
            ref={wordInputRef}
            value={word}
            onChange={(e) => setWord(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={handleDictionarySearch}
            className={`bg-blue ${loading ? "disabled" : ""}`}
            disabled={loading}
          >
            {loading ? "검색 중..." : "사전 검색"}
          </button>
        </div>

        {/* 검색 결과 표시 */}
        {searchResults.length > 0 && (
          <div className="search-results">
            <p>검색 결과:</p>
            <ul>
              {searchResults.map((result, index) => (
                <li
                  key={index}
                  className={`${
                    selectedResult === index ? "selected" : ""
                  }`}
                  onClick={() => handleSelectMeaning(result.description, index)}
                >
                  <p>{result.title}</p>
                  <p>{result.description}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 에러 메시지 표시 */}
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="mean">의미</label>
          <input
            type="text"
            id="mean"
            value={mean}
            onChange={(e) => setMean(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="memo">메모</label>
          <textarea
            id="memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows="3"
            placeholder="추가 메모를 입력하세요 (선택사항)"
          />
        </div>

        <button type="submit" className="bg-green">
          단어 추가
        </button>
      </form>
    </div>
  );
}
