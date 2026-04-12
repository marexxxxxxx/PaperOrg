import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AgentsPage } from './pages/AgentsPage'
import { TicketsPage } from './pages/TicketsPage'
import { RoadmapsPage } from './pages/RoadmapsPage'
import { DashboardPage } from './pages/DashboardPage'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/roadmaps" element={<RoadmapsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App