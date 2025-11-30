import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App, { HomeLanding } from './App.jsx'
import FeaturesPage from './pages/Features.jsx'
import FeatureDetail from './pages/FeatureDetail.jsx'
import LoginPage from './pages/Login.jsx'
import RegisterPage from './pages/Register.jsx'
import ChatPage from './pages/Chat.jsx'
import CoachDashboard from './pages/CoachDashboard.jsx'
import CoachAssignTask from './pages/CoachAssignTask.jsx'
import CoachTasks from './pages/CoachTasks.jsx'
import CoachTraineeDetail from './pages/CoachTraineeDetail.jsx'
import CoachTraineesPage from './pages/CoachTraineesPage.jsx'
import CoachStatistics from './pages/CoachStatistics.jsx'
import TraineeDashboard from './pages/TraineeDashboard.jsx'
import TraineeTasks from './pages/TraineeTasks.jsx'
import TraineeTaskDetail from './pages/TraineeTaskDetail.jsx'
import TraineeProgress from './pages/TraineeProgress.jsx'
import TraineeProfile from './pages/TraineeProfile.jsx'
import MealPlanner from './pages/MealPlanner.jsx'
import AIAssistant from './pages/AIAssistant.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: '/', element: <HomeLanding /> },
      { path: '/features', element: <FeaturesPage /> },
      { path: '/feature/:slug', element: <FeatureDetail /> },
      { path: '/meal-planner', element: <MealPlanner /> },
      { path: '/ai-assistant', element: <AIAssistant /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/chat', element: <ChatPage /> },
      { path: '/coach/dashboard', element: <CoachDashboard /> },
      { path: '/coach/assign-task', element: <CoachAssignTask /> },
      { path: '/coach/tasks', element: <CoachTasks /> },
      { path: '/coach/trainee/:id', element: <CoachTraineeDetail /> },
      { path: '/coach/trainees', element: <CoachTraineesPage /> },
      { path: '/coach/statistics', element: <CoachStatistics /> },
      { path: '/trainee/dashboard', element: <TraineeDashboard /> },
      { path: '/trainee/tasks', element: <TraineeTasks /> },
      { path: '/trainee/tasks/:id', element: <TraineeTaskDetail /> },
      { path: '/trainee/progress', element: <TraineeProgress /> },
      { path: '/trainee/profile', element: <TraineeProfile /> },
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
