import { Navigate, Route, Routes } from 'react-router';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { BrowsePage } from './pages/BrowsePage';
import { LoginPage } from './pages/LoginPage';
import { MyListPage } from './pages/MyListPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RegisterPage } from './pages/RegisterPage';
import { SearchPage } from './pages/SearchPage';
import { TitleDetailsPage } from './pages/TitleDetailsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/browse" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/title/:imdbId" element={<TitleDetailsPage />} />
          <Route path="/my-list" element={<MyListPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
