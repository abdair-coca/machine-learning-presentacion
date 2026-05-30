import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import './styles/tokens.css';
import './styles/globals.css';

import { App } from './App';
import { Home } from './routes/Home';
import { LessonRoute } from './routes/LessonRoute';
import { PyodideProvider } from './lib/pyodide/provider';
import { PyodideLoader } from './components/ui/PyodideLoader';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <PyodideProvider>
        <PyodideLoader />
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            <Route path="lesson/:slug" element={<LessonRoute />} />
          </Route>
        </Routes>
      </PyodideProvider>
    </BrowserRouter>
  </StrictMode>,
);
