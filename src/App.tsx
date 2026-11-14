import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import { Layout } from './components/Layout'
import { AuthPage } from './pages/AuthPage'
import { useProgress } from './storage/ProgressContext'

const AnalysisPage = lazy(() => import('./pages/AnalysisPage').then((module) => ({ default: module.AnalysisPage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const DiagnosticPage = lazy(() => import('./pages/DiagnosticPage').then((module) => ({ default: module.DiagnosticPage })))
const ExercisesPage = lazy(() => import('./pages/ExercisesPage').then((module) => ({ default: module.ExercisesPage })))
const ExerciseDetailPage = lazy(() => import('./pages/ExerciseDetailPage').then((module) => ({ default: module.ExerciseDetailPage })))
const MistakesPage = lazy(() => import('./pages/MistakesPage').then((module) => ({ default: module.MistakesPage })))
const MockExamPage = lazy(() => import('./pages/MockExamPage').then((module) => ({ default: module.MockExamPage })))
const PracticePage = lazy(() => import('./pages/PracticePage').then((module) => ({ default: module.PracticePage })))
const SimulatorsPage = lazy(() => import('./pages/SimulatorsPage').then((module) => ({ default: module.SimulatorsPage })))
const FormulasPage = lazy(() => import('./pages/FormulasPage').then((module) => ({ default: module.FormulasPage })))
const OfficialFormulaPage = lazy(() => import('./pages/OfficialFormulaPage').then((module) => ({ default: module.OfficialFormulaPage })))
const UnitsPage = lazy(() => import('./pages/UnitsPage').then((module) => ({ default: module.UnitsPage })))
const StudyPlanPage = lazy(() => import('./pages/StudyPlanPage').then((module) => ({ default: module.StudyPlanPage })))
const StudyPage = lazy(() => import('./pages/StudyPage').then((module) => ({ default: module.StudyPage })))
const TheoryPage = lazy(() => import('./pages/TheoryPage').then((module) => ({ default: module.TheoryPage })))

export default function App() {
  const { loading, user } = useAuth()
  const { ready } = useProgress()

  if (loading || (user && !ready)) return <div className="app-loading" role="status"><div className="brand"><span>FSIAP</span><small>PREP</small></div><p>A preparar o teu espaço…</p></div>
  if (!user) return <AuthPage />

  return (
    <Layout>
      <Suspense fallback={<div className="route-loading" role="status">A preparar o próximo passo…</div>}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/exercises" element={<ExercisesPage />} />
          <Route path="/exercises/:id" element={<ExerciseDetailPage />} />
          <Route path="/exam-exercises" element={<Navigate to="/exercises?c=exams" replace />} />
          <Route path="/theory" element={<TheoryPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/diagnostic" element={<DiagnosticPage />} />
          <Route path="/study" element={<StudyPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/simulators" element={<SimulatorsPage />} />
          <Route path="/formulas" element={<FormulasPage />} />
          <Route path="/formula-sheet" element={<OfficialFormulaPage />} />
          <Route path="/units" element={<UnitsPage />} />
          <Route path="/study-plan" element={<StudyPlanPage />} />
          <Route path="/mock-exam" element={<MockExamPage />} />
          <Route path="/mistakes" element={<MistakesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}
