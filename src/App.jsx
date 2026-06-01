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
import PredictionDetail from "./pages/spectator/PredictionDetail";
import Profile from "./pages/spectator/Profile";
import Results from "./pages/spectator/Results";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerLayout from "./pages/owner/OwnerLayout";
import JockeyAssignments from "./pages/jockey/JockeyAssignments";
import JockeyDashboard from "./pages/jockey/JockeyDashboard";
import JockeyInvitations from "./pages/jockey/JockeyInvitations";
import JockeyLayout from "./pages/jockey/JockeyLayout";
import JockeyProfile from "./pages/jockey/JockeyProfile";
import JockeyResults from "./pages/jockey/JockeyResults";
import JockeySchedule from "./pages/jockey/JockeySchedule";
import {
  OwnerHorseDetail,
  OwnerHorseForm,
  OwnerHorses,
  OwnerJockeys,
  OwnerProfile,
  OwnerRegistrations,
  OwnerResults,
  OwnerSchedule,
} from "./pages/owner/OwnerPages";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/:module" element={<AdminModulePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/owner" element={<OwnerLayout />}>
        <Route index element={<OwnerDashboard />} />
        <Route path="horses" element={<OwnerHorses />} />
        <Route path="horses/new" element={<OwnerHorseForm />} />
        <Route path="horses/:horseId" element={<OwnerHorseDetail />} />
        <Route path="horses/:horseId/edit" element={<OwnerHorseForm mode="edit" />} />
        <Route path="registrations" element={<OwnerRegistrations />} />
        <Route path="jockeys" element={<OwnerJockeys />} />
        <Route path="schedule" element={<OwnerSchedule />} />
        <Route path="results" element={<OwnerResults />} />
        <Route path="profile" element={<OwnerProfile />} />
      </Route>

      <Route path="/jockey" element={<JockeyLayout />}>
        <Route index element={<JockeyDashboard />} />
        <Route path="invitations" element={<JockeyInvitations />} />
        <Route path="schedule" element={<JockeySchedule />} />
        <Route path="assignments" element={<JockeyAssignments />} />
        <Route path="results" element={<JockeyResults />} />
        <Route path="profile" element={<JockeyProfile />} />
      </Route>

      {/* User Dashboards Layout */}
      <Route element={<MainLayout />}>
        <Route path="/spectator" element={<SpectatorHome />} />
        <Route path="/spectator/tournaments" element={<TournamentList />} />
        <Route path="/spectator/tournaments/:tournamentId" element={<TournamentDetail />} />
        <Route path="/spectator/leaderboard" element={<Leaderboard />} />
        <Route path="/spectator/predictions" element={<Predictions />} />
        <Route path="/spectator/predictions/:tournamentId" element={<PredictionDetail />} />
        <Route path="/spectator/profile" element={<Profile />} />
        <Route path="/spectator/results" element={<Results />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
