import './Layout.scss';
import { Navbar } from 'react-bootstrap';
import { Link, Outlet } from 'react-router-dom';

function Layout() {
  return (
    <>
      <Navbar expand="lg" variant="light" className="position-sticky top-0 z-10">
        <div className="nav-cont">
          <Link to="/" className="nav-logo">
            LM
          </Link>
          <Link to="/cycling-goal" title="Cycling Goal">
            <i className="bi bi-bicycle" />
          </Link>
          <a href="https://github.com/lukemelong" target="_blank" rel="noreferrer">
            <i className="bi bi-github" />
          </a>
          <a href="https://www.linkedin.com/in/luke-melong/" target="_blank" rel="noreferrer">
            <i className="bi bi-linkedin" />
          </a>
        </div>
      </Navbar>
      <Outlet />
    </>
  );
}

export default Layout;
