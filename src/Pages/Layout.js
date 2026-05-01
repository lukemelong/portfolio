import '../Styles/Layout.scss'
import { Nav, Navbar } from 'react-bootstrap'
import { Link, Outlet } from "react-router-dom"

function Layout() {
  return (
    <>
      <Navbar expand="lg" variant="light" className="position-sticky top-0 z-10">
        <div className="nav-cont">
          <div as={Link} to="/" className="nav-logo">
            LM
          </div>
          <Link to="/cycling-goal" title="Cycling Goal">
            <i className="bi bi-bicycle"></i>
          </Link>
          <a href="https://github.com/lukemelong" target='_blank'>
            <i className="bi bi-github"></i>
          </a>
          <a href="https://www.linkedin.com/in/luke-melong/" target='_blank'>
            <i className="bi bi-linkedin"></i>
          </a>
        </div>
      </Navbar>
      <Outlet />
    </>
  )
}

export default Layout