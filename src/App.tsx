import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index.tsx";

const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
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
