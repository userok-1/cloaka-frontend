import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { ProfilePage } from '../features/auth/pages/ProfilePage';
import { StreamsListPage } from '../features/streams/pages/StreamsListPage';
import { CreateStreamPage } from '../features/streams/pages/CreateStreamPage';
import { StreamDetailPage } from '../features/streams/pages/StreamDetailPage';
import { TrashPage } from '../features/streams/pages/TrashPage';
import { AccessDeniedPage } from '../shared/pages/AccessDeniedPage';
import { NotFoundPage } from '../shared/pages/NotFoundPage';
import { AuthGuard } from '../shared/guards/AuthGuard';

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />

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
              <CreateStreamPage />
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
              <StreamDetailPage />
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

        <Route path="/" element={<Navigate to="/streams" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
