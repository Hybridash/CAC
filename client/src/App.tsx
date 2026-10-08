import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { Layout } from './components/Layout';
import { HomePage } from './pages/Home';
import { LibraryPage } from './pages/Library';
import { Placeholder } from './pages/Placeholder';
import { LessonPage } from './lesson/LessonPage';
import { usePlayer } from './store/player';

export function App() {
  const init = usePlayer((s) => s.init);
  useEffect(() => {
    void init();
    const onOnline = () => void init();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [init]);

  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="learn/:id" element={<LessonPage />} />
            <Route path="map" element={<Placeholder title="Knowledge Map" />} />
            <Route path="mysteries" element={<Placeholder title="Bio Mysteries" />} />
            <Route path="shop" element={<Placeholder title="Shop" />} />
            <Route path="collection" element={<Placeholder title="Collection" />} />
            <Route path="profile" element={<Placeholder title="Profile" />} />
            <Route path="*" element={<Placeholder title="Page not found" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MotionConfig>
  );
}
