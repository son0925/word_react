import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

axios.defaults.withCredentials = true; // CORS 문제를 해결하기 위한 설정

export default function Profile() {
  const [user, setUser] = useState(null);
  const [streaks, setStreaks] = useState([]); // 잔디 데이터를 저장
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get("http://my-word-book.kro.kr:8080/api/user/info", {
        });

        const data = response.data;
        if (data.result.result_code === 200) {
          setUser(data.body);
          fetchStreaksData(data.body.user_id); // 사용자 정보를 가져오면 잔디 데이터도 호출
        } else {
          alert("사용자 정보를 불러오는데 실패했습니다.");
          navigate("/login");
        }
      } catch (error) {
        console.error("사용자 정보 가져오기 오류:", error);
      }
    };

    const fetchStreaksData = async (userId) => {
      try {
        const response = await axios.get(`http://my-word-book.kro.kr:8080/api/streaks/list`);
    
        const data = response.data;
        console.log("잔디 데이터 응답:", data);  // 데이터 확인을 위한 로그 추가
        if (data.result.result_code === 200) {
          setStreaks(data.body); // 잔디 데이터를 상태에 저장
        } else {
          console.error("잔디 데이터를 가져오는데 실패했습니다.");
        }
      } catch (error) {
        console.error("잔디 데이터 가져오기 오류:", error);
      }
    };
    

    fetchUserInfo();
  }, [navigate]);

  const handleFileChange = (e) => {
    handleUpload(e.target.files[0]);
  };

  const handlePictureClick = () => {
    fileInputRef.current.click();
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const response = await axios.post(
        "http://my-word-book.kro.kr:8080/api/user/upload-profile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = response.data;
      if (data.result.result_code === 200) {
        alert("프로필 사진이 성공적으로 업로드되었습니다.");
        setUser((prevUser) => ({ ...prevUser, profile_url: URL.createObjectURL(file) }));
      } else {
        alert("프로필 사진 업로드 실패: " + data.result.result_description);
      }
    } catch (error) {
      console.error("프로필 사진 업로드 오류:", error);
      alert("사진 업로드에 실패했습니다.");
    }
  };

  const handleDeleteUser = async () => {
    const confirmDelete = window.confirm(
      "정말로 탈퇴하시겠습니까? 탈퇴 후에는 복구할 수 없습니다."
    );
    if (confirmDelete) {
      try {
        const response = await axios.delete(
          "http://my-word-book.kro.kr:8080/api/user/delete",
        );

        const data = response.data;
        if (data.result.result_code === 200) {
          alert("회원 탈퇴가 완료되었습니다.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          alert("탈퇴에 실패했습니다: " + data.result.result_description);
        }
      } catch (error) {
        console.error("탈퇴 오류:", error);
        alert("탈퇴 요청 처리 중 오류가 발생했습니다.");
      }
    }
  };

  // 잔디 시각화 컴포넌트
  const renderStreaks = () => {
    const currentDate = new Date();
    const startDate = new Date();
    startDate.setDate(currentDate.getDate() - 364); // 최근 1년 데이터 표시
  
    // 여기에 맵핑된 streaksMap이 사용됩니다.
    const streaksMap = new Map(streaks.map(({ date, problems_solved }) => [date, problems_solved]));
    console.log("streaksMap:", [...streaksMap.entries()]);

    const grid = [];
    let week = [];
  
    // 최근 1년간 날짜를 순회
    for (let d = new Date(startDate); d <= currentDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split("T")[0]; // YYYY-MM-DD 형식
      const problemsSolved = streaksMap.get(dateKey) || 0; // 기본값 0 처리
  
      week.push(
        <div
          key={dateKey}
          className="streak-box"
          title={`${dateKey}: ${problemsSolved} 문제 해결`}
          style={{
            backgroundColor: problemsSolved > 0
              ? `rgba(76, 175, 80, ${0.3 + 0.7 * Math.min(problemsSolved / 10, 1)})`
              : "#e0e0e0",
          }}
        ></div>
      );
  
      // 한 주가 끝나거나 데이터 마지막 날짜인 경우
      if (d.getDay() === 6 || d.getTime() === currentDate.getTime()) {
        grid.push(
          <div key={`week-${d.toISOString()}`} className="streak-week">
            {week}
          </div>
        );
        week = []; // 새 주를 위해 초기화
      }
    }
  
    return <div className="streak-grid">{grid}</div>;
  };
  


  if (!user) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="profile-container">
      <h2>{user.name}님의 정보</h2>

      {/* 프로필 사진 */}
      <div
        className="profile-picture"
        onClick={handlePictureClick}
        style={{ cursor: "pointer" }}
      >
        <img
          src={user.profile_url || "https://via.placeholder.com/150"}
          alt="Profile"
        />
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* 사용자 정보 */}
      <div className="user-info">
        <p>
          <strong>아이디:</strong> {user.user_id}
        </p>
        <p>
          <strong>이름:</strong> {user.name}
        </p>
        <p>
          <strong>생년월일:</strong>{" "}
          {new Date(user.birthdate).toLocaleDateString()}
        </p>
        <p>
          <strong>최근 로그인:</strong>{" "}
          {new Date(user.last_login_time).toLocaleString()}
        </p>
        <p>
          <strong>계정 상태:</strong> {user.status}
        </p>
      </div>

      {/* 잔디 시각화 */}
      <div className="streaks-section">
        <h3>활동 잔디</h3>
        {renderStreaks()}
      </div>


      <div className="stats-link">
        <button onClick={() => navigate("/statistics")}>단어 통계 보러가기</button>
      </div>
      <div className="change-password">
        <button onClick={() => navigate("/change-password")}>
          비밀번호 변경하기
        </button>
      </div>
      <div className="back-to-home">
        <button onClick={() => navigate("/")}>메인 페이지로 돌아가기</button>
      </div>
      <div className="delete-account">
        <button
          onClick={handleDeleteUser}
          style={{ backgroundColor: "#dc3545", color: "white" }}
        >
          탈퇴하기
        </button>
      </div> 
    </div>
  );
}