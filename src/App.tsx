import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import './lib/i18n'; // Initialize i18n
import { Suspense } from 'react';

import Home from './pages/public/Home';
import ContentList from './pages/public/ContentList';
import ContentDetail from './pages/public/ContentDetail';
import VerifyCertificate from './pages/public/VerifyCertificate';

import AdminDashboard from './pages/admin/AdminDashboard';
import RoleManager from './pages/admin/RoleManager';
import ContentManager from './pages/admin/ContentManager';
import ContentEditor from './pages/admin/ContentEditor';

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-serif text-2xl text-primary-900">Loading...</div>}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="articles" element={<ContentList overrideType="article" />} />
              <Route path="articles/:slug" element={<ContentDetail />} />
              <Route path="theses" element={<ContentList overrideType="thesis" />} />
              <Route path="theses/:slug" element={<ContentDetail />} />
              <Route path="conference-papers" element={<ContentList overrideType="conference_paper" />} />
              <Route path="conference-papers/:slug" element={<ContentDetail />} />
              <Route path="poems" element={<ContentList overrideType="poetry" />} />
              <Route path="poems/:slug" element={<ContentDetail />} />
              <Route path="content/:slug" element={<ContentDetail />} />
              <Route path="authors" element={<ContentList overrideType="author" />} />
              <Route path="archive" element={<ContentList overrideType="archive" />} />
              <Route path="scholar" element={<ContentList overrideType="scholar" />} />
              <Route path="verify" element={<VerifyCertificate />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="content" element={<ContentManager />} />
              <Route path="content/new" element={<ContentEditor />} />
              <Route path="content/edit/:id" element={<ContentEditor />} />
              <Route path="roles" element={<RoleManager />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </Suspense>
  );
}
