import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { ProfilePage } from '../features/auth/pages/ProfilePage';
import { HomePage } from '../features/home/pages/HomePage';
import { UsersPage } from '../features/users/pages/UsersPage';
import { StreamsListPage } from '../features/streams/pages/StreamsListPage';
import { CreateStreamPage } from '../features/streams/pages/CreateStreamPage';
import { StreamDetailPage } from '../features/streams/pages/StreamDetailPage';
import { TrashPage } from '../features/streams/pages/TrashPage';
import { LogsPage } from '../features/logs/pages/LogsPage';
import { DocsPage } from '../features/docs/pages/DocsPage';
import { HelpPage } from '../features/help/pages/HelpPage';
import { AccessDeniedPage } from '../shared/pages/AccessDeniedPage';
import { NotFoundPage } from '../shared/pages/NotFoundPage';
import { AuthGuard } from '../shared/guards/AuthGuard';
import { RoleGuard } from '../shared/guards/RoleGuard';
import { ErrorBoundary } from '../shared/ui/ErrorBoundary';

export function Router() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />

          <Route
            path="/"
            element={
              <AuthGuard>
                <HomePage />
              </AuthGuard>
            }
          />
          <Route
            path="/users"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={['admin']}>
                  <UsersPage />
                </RoleGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/streams"
            element={
              <AuthGuard>
                <StreamsListPage />
              </AuthGuard>
            }
          />
          <Route
            path="/streams/new"
            element={
              <AuthGuard>
                <ErrorBoundary>
                  <CreateStreamPage />
                </ErrorBoundary>
              </AuthGuard>
            }
          />
          <Route
            path="/streams/trash"
            element={
              <AuthGuard>
                <TrashPage />
              </AuthGuard>
            }
          />
          <Route
            path="/streams/:id"
            element={
              <AuthGuard>
                <ErrorBoundary>
                  <StreamDetailPage />
                </ErrorBoundary>
              </AuthGuard>
            }
          />
          <Route
            path="/logs"
            element={
              <AuthGuard>
                <LogsPage />
              </AuthGuard>
            }
          />
          <Route
            path="/profile"
            element={
              <AuthGuard>
                <ProfilePage />
              </AuthGuard>
            }
          />
          <Route
            path="/docs"
            element={
              <AuthGuard>
                <DocsPage />
              </AuthGuard>
            }
          />
          <Route
            path="/help"
            element={
              <AuthGuard>
                <HelpPage />
              </AuthGuard>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
