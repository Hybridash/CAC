import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { Layout } from './components/Layout';
import { HomePage } from './pages/Home';
import { Placeholder } from './pages/Placeholder';
import { usePlayer } from './store/player';

const LibraryPage = lazy(() => import('./pages/Library').then((m) => ({ default: m.LibraryPage })));
const LessonPage = lazy(() =>
  import('./lesson/LessonPage').then((m) => ({ default: m.LessonPage })),
);
const ShopPage = lazy(() => import('./shop/ShopPage').then((m) => ({ default: m.ShopPage })));
const CollectionPage = lazy(() =>
  import('./shop/CollectionPage').then((m) => ({ default: m.CollectionPage })),
);
const KnowledgeMapPage = lazy(() =>
  import('./map/KnowledgeMapPage').then((m) => ({ default: m.KnowledgeMapPage })),
);
const ProfilePage = lazy(() =>
  import('./profile/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);
const MysteriesPage = lazy(() =>
  import('./mysteries/MysteriesPage').then((m) => ({ default: m.MysteriesPage })),
);
const MysteryCasePage = lazy(() =>
  import('./mysteries/MysteryCasePage').then((m) => ({ default: m.MysteryCasePage })),
);

function Loading() {
  return (
    <div className="grid min-h-[50vh] place-items-center" role="status">
      <span className="animate-float text-5xl" aria-hidden>
        🧫
      </span>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

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
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="library" element={<LibraryPage />} />
              <Route path="learn/:id" element={<LessonPage />} />
              <Route path="map" element={<KnowledgeMapPage />} />
              <Route path="mysteries" element={<MysteriesPage />} />
              <Route path="mysteries/:id" element={<MysteryCasePage />} />
              <Route path="shop" element={<ShopPage />} />
              <Route path="collection" element={<CollectionPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="*" element={<Placeholder title="Page not found" />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </MotionConfig>
  );
}
