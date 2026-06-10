import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminDashboard from "./Admin/AdminDashboard";
import AdminModulePage from "./Admin/AdminModulePage";
import LandingPage from "./Landing Page/LandingPage";
import Login from "./Login/Login";
import SignUp from "./SignUp/SignUp";
import RefereeDashboard from "./Referee/RefereeDashboard";
import RefereeRaces from "./Referee/RefereeRaces";
import RefereeRaceDetail from "./Referee/RefereeRaceDetail";
import HorseInspection from "./Referee/HorseInspection";
import JockeyInspection from "./Referee/JockeyInspection";
import RaceMonitor from "./Referee/RaceMonitor";
import ViolationManagement from "./Referee/ViolationManagement";
import RaceResult from "./Referee/RaceResult";
import RaceReport from "./Referee/RaceReport";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/:module" element={<AdminModulePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Referee module */}
      <Route path="/referee" element={<RefereeDashboard />} />
      <Route path="/referee/races" element={<RefereeRaces />} />
      <Route path="/referee/races/:raceId" element={<RefereeRaceDetail />} />
      <Route path="/referee/races/:raceId/horse-inspection" element={<HorseInspection />} />
      <Route path="/referee/races/:raceId/jockey-inspection" element={<JockeyInspection />} />
      <Route path="/referee/races/:raceId/monitor" element={<RaceMonitor />} />
      <Route path="/referee/races/:raceId/violations" element={<ViolationManagement />} />
      <Route path="/referee/races/:raceId/result" element={<RaceResult />} />
      <Route path="/referee/races/:raceId/report" element={<RaceReport />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
