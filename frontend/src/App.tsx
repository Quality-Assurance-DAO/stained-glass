import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ChurchSearchPage } from './pages/ChurchSearchPage';
import { ChurchDetailPage } from './pages/ChurchDetailPage';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ChurchSearchPage />} />
          <Route path="/churches/:churchId" element={<ChurchDetailPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

