import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { ProfilePage } from '../features/auth/pages/ProfilePage';
import { HomePage } from '../features/home/pages/HomePage';
import { StreamsListPage } from '../features/streams/pages/StreamsListPage';
import { CreateStreamPage } from '../features/streams/pages/CreateStreamPage';
import { StreamDetailPage } from '../features/streams/pages/StreamDetailPage';
import { TrashPage } from '../features/streams/pages/TrashPage';
import { FilterLogsPage } from '../features/logs/pages/FilterLogsPage';
import { AccessDeniedPage } from '../shared/pages/AccessDeniedPage';
import { NotFoundPage } from '../shared/pages/NotFoundPage';
import { AuthGuard } from '../shared/guards/AuthGuard';
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
                <FilterLogsPage />
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

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
