import React, { useEffect, useState } from 'react';
import axios from 'axios';

// 쿠키에서 특정 이름의 토큰 값을 가져오는 함수
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

export default function WordList() {
  const [words, setWords] = useState([]);  // Word list state
  const [loading, setLoading] = useState(true);  // Loading state
  const [error, setError] = useState(null);  // Error state
  const [isEditing, setIsEditing] = useState(false);  // Is editing state
  const [editWord, setEditWord] = useState({});  // Edited word state

  const [currentPage, setCurrentPage] = useState(0);  // Pagination state
  const [pageSize, setPageSize] = useState(10);  // Number of items per page
  const [totalPages, setTotalPages] = useState(1);  // Total number of pages

  // Set the default sorting criteria to addedDate and descending order
  const [sortBy, setSortBy] = useState('addedDate');  // Default to addedDate
  const [sortDirection, setSortDirection] = useState('desc');  // Default to descending order

  // Search word state
  const [searchWord, setSearchWord] = useState('');  // Search term

  // Fetch words with pagination, sorting, and search
  const fetchWords = async () => {
    try {
      const response = await axios.get('http://my-word-book.kro.kr:8080/word/list', {
        params: {
          page: currentPage,
          size: pageSize,
          sortBy: sortBy,
          order: sortDirection,
          searchWord: searchWord,  // Ensure this is included in the API call
        },
        headers: {
        },
        withCredentials: true,
      });
      setWords(response.data.body);  // Set the words based on API response
      setTotalPages(response.data.pagination.total_page);  // Set total pages for pagination
    } catch (err) {
      setError('단어 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Delete word function with confirmation
  const deleteWord = async (wordId) => {
    if (window.confirm('정말로 이 단어를 삭제하시겠습니까?')) {
      try {
        const response = await axios.delete(`http://my-word-book.kro.kr:8080/word/delete/${wordId}`);
        setWords(words.filter((word) => word.word_id !== wordId));  // UI 갱신
        alert(response.data.body);
      } catch (err) {
        setError('단어 삭제에 실패했습니다.');
      }
    }
  };
  

  // Update word function
  const handleUpdate = async (updatedWord) => {
    try {
      const response = await axios.put('http://my-word-book.kro.kr:8080/word/update', {
        body : {
          word_id: updatedWord.word_id,
          word: updatedWord.word,
          mean: updatedWord.mean,
          memo: updatedWord.memo,
        }
      });
      alert("단어 수정을 성공하셨습니다.");
      const updatedWords = words.map((word) =>
        word.word_id === updatedWord.word_id ? response.data.body : word
      );
      setWords(updatedWords);
      setIsEditing(false);
    } catch (err) {
      alert("단어 수정에 실패했습니다.");
    }
  };
  

  // Change page function
  const changePage = (pageNumber) => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // 페이지 이동 시 최상단으로 스크롤
    }
  };

  // Fetch words on component mount or when pagination, sorting, or search changes
  useEffect(() => {
    fetchWords();
  }, [currentPage, pageSize, sortBy, sortDirection, searchWord]);

  if (loading) return <div className="main-content">로딩중...</div>;
  if (error) return <div className="main-content error">{error}</div>;

  // Handle search button click
  const handleSearch = () => {
    setCurrentPage(0);  // Reset to the first page when search is performed
    fetchWords();  // Trigger search
  };

  return (
    <div className="main-content">
      <h1>단어 리스트</h1>
      <p className="card">저장된 단어들의 목록을 볼 수 있는 페이지입니다.</p>

      {/* Sorting Controls */}
      <div className="card">
        <div className="sort-controls">
          <div className="sort-group">
            <label>정렬 기준:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="word">사전순</option>
              <option value="addedDate">추가한 날짜</option>
            </select>
          </div>
          <div className="sort-group">
            <label>정렬 방향:</label>
            <select value={sortDirection} onChange={(e) => setSortDirection(e.target.value)}>
              <option value="asc">오름차순</option>
              <option value="desc">내림차순</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="card">
        <div className="search-group">
          <label>검색:</label>
          <input
            type="text"
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            placeholder="단어 검색"
            style={{ width: '200px' }}  // Adjust width as needed
          />
        </div>
      </div>

      {/* Editing Word */}
      {isEditing ? (
        <div className="card">
          <h2>단어 수정</h2>
          <div className="form-group">
            <label>단어:</label>
            <input
              type="text"
              value={editWord.word}
              onChange={(e) => setEditWord({ ...editWord, word: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>뜻:</label>
            <input
              type="text"
              value={editWord.mean}
              onChange={(e) => setEditWord({ ...editWord, mean: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>메모:</label>
            <textarea
              value={editWord.memo || ''}
              onChange={(e) => setEditWord({ ...editWord, memo: e.target.value })}
              rows="3"
            />
          </div>
          <div className="button-group">
            <button onClick={() => handleUpdate(editWord)}>수정하기</button>
            <button onClick={() => setIsEditing(false)} style={{ backgroundColor: '#DAA520' }}>
              취소
            </button>
          </div>
        </div>
      ) : (
        <ul>
          {words.length > 0 ? (
            words.map((word) => (
              <li key={word.word_id} className="card word-item">
                <div className="word-content">
                  <div className="word-header">
                    <h3>{word.word}</h3>
                    <div className="button-group">
                      <button onClick={() => { setIsEditing(true); setEditWord(word); }}>수정</button>
                      <button onClick={() => deleteWord(word.word_id)} style={{ backgroundColor: '#dc3545' }}>
                        삭제
                      </button>
                    </div>
                  </div>
                  <div className="word-meaning">{word.mean}</div>
                  {word.memo && (
                    <div className="word-memo">
                      메모: {word.memo}
                    </div>
                  )}
                </div>
              </li>
            ))
          ) : (
            <p className="card">저장된 단어가 없습니다.</p>
          )}
        </ul>
      )}

      {/* Pagination Controls */}
      <div className="pagination">
        <button
          onClick={() => changePage(currentPage - 1)}
          disabled={currentPage <= 0}
        >
          이전
        </button>
        <span className="page-info">{currentPage + 1} / {totalPages}</span>
        <button
          onClick={() => changePage(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
        >
          다음
        </button>
      </div>
    </div>
  );
}
