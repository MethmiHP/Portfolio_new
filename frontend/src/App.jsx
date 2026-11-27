import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Portfolio from './Portfolio';
const AdminPage = lazy(() => import('../components/AdminPage'));
const ClientPortal = lazy(() => import('../components/ClientPortal'));
const ProjectHandover = lazy(() => import('../components/ProjectHandover'));
import './index.css';
import PageSeo from '../components/PageSeo';

function App() {
  return (
    <BrowserRouter>
      <PageSeo />
      <Suspense fallback={<div className="loading-screen" role="status">Loading page...</div>}>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/hire" element={<ProjectHandover />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/client-login" element={<ClientPortal />} />
        <Route path="/client" element={<ClientPortal />} />
        <Route path="*" element={<main style={{ padding: '4rem' }}><h1>Page not found</h1><a href="/">Back to portfolio</a></main>} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
