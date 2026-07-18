import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import questionsData from "../../data/question.json";
import logo from "../../images/logo.png";
// import background from "../../images/background.mp4";
import "./Detail.css";

const Detail = () => {
  const { id } = useParams();

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [prevId, setPrevId] = useState(id);
  const [timeLeft, setTimeLeft] = useState(10); // State lưu thời gian đếm ngược (10 giây)

  // Reset toàn bộ trạng thái (đáp án và thời gian) khi chuyển câu hỏi
  if (id !== prevId) {
    setPrevId(id);
    setSelectedAnswer(null);
    setTimeLeft(10);
  }

  const currentQuestion = questionsData.find((q) => q.id === parseInt(id));

  // Hook xử lý đồng hồ đếm ngược
  useEffect(() => {
    // Nếu người dùng đã chọn đáp án thì dừng hoàn toàn mọi thứ
    if (selectedAnswer !== null) return;

    // Khi thời gian chạm mốc 0: Gán trạng thái TIMEOUT một cách bất đồng bộ
    if (timeLeft <= 0) {
      const timeoutId = setTimeout(() => {
        setSelectedAnswer("TIMEOUT");
      }, 0); // Đợi 0ms để tránh lỗi cascading renders
      return () => clearTimeout(timeoutId);
    }

    // Đếm lùi mỗi 1 giây (1000ms) khi thời gian vẫn > 0
    const timerId = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    // Dọn dẹp bộ đếm
    return () => clearTimeout(timerId);
  }, [timeLeft, selectedAnswer]);

  if (!currentQuestion) {
    return <div>Không tìm thấy câu hỏi!</div>;
  }

  const formattedNumber =
    currentQuestion.id < 10 ? `0${currentQuestion.id}` : currentQuestion.id;

  const handleAnswerClick = (answerKey) => {
    // Chỉ cho phép click nếu chưa chọn VÀ thời gian vẫn còn
    if (!selectedAnswer && timeLeft > 0) {
      setSelectedAnswer(answerKey);
    }
  };

  const getButtonClass = (answerKey) => {
    let className = "option-btn";

    if (selectedAnswer) {
      if (answerKey === currentQuestion.correctAnswer) {
        className += " correct"; // Đáp án đúng luôn hiện màu xanh
      } else if (answerKey === selectedAnswer && selectedAnswer !== "TIMEOUT") {
        className += " wrong"; // Chỉ hiện đỏ nếu người chơi THỰC SỰ bấm sai
      }
    }
    return className;
  };

  const renderOption = (key) => (
    <div className="option-item" onClick={() => handleAnswerClick(key)}>
      <span className="option-letter">{key}</span>
      <button
        className={getButtonClass(key)}
        disabled={selectedAnswer !== null}
      >
        {currentQuestion.options[key]}
      </button>
    </div>
  );

  return (
    <div className="quiz-container">
      {/* <video autoPlay muted loop playsInline className="video-bg">
        <source src={background} type="video/mp4" />
      </video> */}
      {/* Khối hiển thị Đồng hồ đếm ngược */}
      <div className="timer-wrapper">
        <span className="timer-text">
          00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
        </span>
      </div>

      <header className="quiz-header">
        <img src={logo} alt="Logo Tâm Agency" className="logo-image" />
        <h1 className="question-number">NUMBER {formattedNumber}</h1>
      </header>

      <main className="quiz-main">
        <h2 className="question-text">{currentQuestion.question}</h2>

        <div className="options-wrapper">
          <div className="options-grid">
            <div className="option-column">
              {renderOption("A")}
              {renderOption("B")}
            </div>
            <div className="option-column">
              {renderOption("C")}
              {renderOption("D")}
            </div>
          </div>
        </div>
      </main>

      <Link to="/" className="back-btn">
        Quay lại danh sách
      </Link>
    </div>
  );
};

export default Detail;
