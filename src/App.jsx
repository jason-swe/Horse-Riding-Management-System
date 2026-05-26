import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminDashboard from "./Admin/AdminDashboard";
import AdminModulePage from "./Admin/AdminModulePage";
import LandingPage from "./Landing Page/LandingPage";
import Login from "./Login/Login";
import SignUp from "./SignUp/SignUp";
import MainLayout from "./layouts/MainLayout";
import SpectatorHome from "./pages/spectator/SpectatorHome";
import TournamentList from "./pages/spectator/TournamentList";
import TournamentDetail from "./pages/spectator/TournamentDetail";
import Leaderboard from "./pages/spectator/Leaderboard";
import Predictions from "./pages/spectator/Predictions";
import Profile from "./pages/spectator/Profile";
import Results from "./pages/spectator/Results";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/:module" element={<AdminModulePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* User Dashboards Layout */}
      <Route element={<MainLayout />}>
        <Route path="/spectator" element={<SpectatorHome />} />
        <Route path="/spectator/tournaments" element={<TournamentList />} />
        <Route path="/spectator/tournaments/:tournamentId" element={<TournamentDetail />} />
        <Route path="/spectator/leaderboard" element={<Leaderboard />} />
        <Route path="/spectator/predictions" element={<Predictions />} />
        <Route path="/spectator/profile" element={<Profile />} />
        <Route path="/spectator/results" element={<Results />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
