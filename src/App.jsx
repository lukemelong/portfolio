import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout/Layout';
import Home from './pages/Home/Home';
import CyclingGoalPage from './pages/CyclingGoal/CyclingGoalPage';
import NflScoreboardPage from './pages/NflScoreboard/NflScoreboardPage';
import SpeedrunTrackerPage from './pages/SpeedrunTracker/SpeedrunTrackerPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
        </Route>
        <Route path="/cycling-goal" element={<CyclingGoalPage />} />
        <Route path="/nfl-scoreboard" element={<NflScoreboardPage />} />
        <Route path="/speedrun" element={<SpeedrunTrackerPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
