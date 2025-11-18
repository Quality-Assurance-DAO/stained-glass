import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ChurchSearchPage } from './pages/ChurchSearchPage';
import { ChurchDetailPage } from './pages/ChurchDetailPage';
import { PhotoUploadPage } from './pages/PhotoUploadPage';
import { PhotoAssignmentPage } from './pages/PhotoAssignmentPage';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ChurchSearchPage />} />
          <Route path="/churches/:churchId" element={<ChurchDetailPage />} />
          <Route path="/churches/:churchId/upload" element={<PhotoUploadPage />} />
          <Route path="/churches/:churchId/submissions/:submissionId/assign" element={<PhotoAssignmentPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

