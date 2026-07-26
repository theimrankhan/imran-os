import { Providers } from "./providers"
import { RouterProvider, useRouter } from "./lib/router"
import { AppLayout } from "./components/layout/AppLayout"
import { GlobalSearch } from "./components/search/GlobalSearch"
import { ErrorBoundary } from "./components/ErrorBoundary"
import Dashboard from "./pages/Dashboard"
import TimetablePage from "./pages/TimetablePage"
import AttendancePage from "./pages/AttendancePage"
import NotesPage from "./pages/NotesPage"
import SubjectsPage from "./pages/SubjectsPage"
import SettingsPage from "./pages/SettingsPage"
import { CalendarPage } from "./pages/CalendarPage"

function Router() {
  const { path, navigate } = useRouter()

  const page = (() => {
    switch (path) {
      case "/": return <Dashboard />
      case "/calendar": return <CalendarPage />
      case "/timetable": return <TimetablePage />
      case "/attendance": return <AttendancePage />
      case "/notes": return <NotesPage />
      case "/subjects": return <SubjectsPage />
      case "/settings": return <SettingsPage />
      default: return <Dashboard />
    }
  })()

  return (
    <AppLayout currentPath={path} onNavigate={navigate}>
      {page}
    </AppLayout>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider>
        <Providers>
          <Router />
          <GlobalSearch />
        </Providers>
      </RouterProvider>
    </ErrorBoundary>
  )
}

export default App
