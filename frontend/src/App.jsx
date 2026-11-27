import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Portfolio from './Portfolio';
import AdminPage from '../components/AdminPage';
import ClientPortal from '../components/ClientPortal';
import ProjectHandover from '../components/ProjectHandover';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/hire" element={<ProjectHandover />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/client-login" element={<ClientPortal />} />
        <Route path="/client" element={<ClientPortal />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
