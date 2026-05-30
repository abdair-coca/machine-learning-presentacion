import { Link, Outlet, useLocation } from 'react-router-dom';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { PyodideStatusBadge } from './components/ui/PyodideStatusBadge';
import { PresenterToggle } from './components/ui/PresenterToggle';
import { BgOrbs } from './components/ui/BgOrbs';
import styles from './App.module.css';

export function App() {
  const loc = useLocation();
  const isHome = loc.pathname === '/';
  return (
    <>
      <BgOrbs />
      <nav className={`${styles.nav} __hide-on-presenter__`}>
        <div className={styles.navInner}>
          <Link to="/" className={styles.brand}>
            <span>ml<span className={styles.brandSlash}>/</span>lab</span>
          </Link>
          <div className={styles.navRight}>
            {!isHome && (
              <Link to="/" className={styles.navLink}>
                ← Lecciones
              </Link>
            )}
            <PyodideStatusBadge />
            <PresenterToggle />
            <ThemeToggle />
          </div>
        </div>
      </nav>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer} data-app-footer>
        <span>
          ml<span className={styles.brandSlash}>/</span>lab · plataforma educativa · Python en el
          navegador con Pyodide · pulsa <kbd>F</kbd> para modo presentación
        </span>
      </footer>
    </>
  );
}

export default App;
