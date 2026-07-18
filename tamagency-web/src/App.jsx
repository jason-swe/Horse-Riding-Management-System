import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import QuestionDetail from "./component/Detail/Detail";
import Home from "./component/AllQuestion";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/question/:id" element={<QuestionDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
