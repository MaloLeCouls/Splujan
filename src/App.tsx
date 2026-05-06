import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './ui/pages/HomePage'
import EditorPage from './ui/pages/EditorPage'
import SimulationPage from './ui/pages/SimulationPage'
import CalibrationPage from './ui/pages/CalibrationPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/editor/:profileId?" element={<EditorPage />} />
        <Route path="/simulation/:profileId" element={<SimulationPage />} />
        <Route path="/calibration" element={<CalibrationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
