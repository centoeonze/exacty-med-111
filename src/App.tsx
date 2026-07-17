import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Index from "./pages/Index.tsx";
import CmsRequireAuth from "./cms/auth/CmsRequireAuth";

const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const AdminCms = lazy(() => import("./pages/AdminCms.tsx"));

const adminFallback = (
  <div className="flex min-h-screen items-center justify-center bg-[#0b0714] text-sm text-white/70">
    Carregando CMS…
  </div>
);

const ProtectedAdmin = () => (
  <CmsRequireAuth>
    {({ logout }) => (
      <Suspense fallback={adminFallback}>
        <AdminCms onLogout={logout} />
      </Suspense>
    )}
  </CmsRequireAuth>
);

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/admin" element={<ProtectedAdmin />} />
      <Route path="/cms" element={<Navigate to="/admin" replace />} />
      <Route path="/editor" element={<Navigate to="/admin" replace />} />
      <Route
        path="*"
        element={
          <Suspense fallback={null}>
            <NotFound />
          </Suspense>
        }
      />
    </Routes>
  </BrowserRouter>
);

export default App;
