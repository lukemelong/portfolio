import '../Styles/Layout.scss'
import { Container, Nav, Navbar } from 'react-bootstrap'
import { Link, Outlet } from "react-router-dom"

function Layout() {
  return (
    <>
      <Navbar expand="lg" variant="light" className="position-sticky top-0 z-10">
          <Navbar.Brand as={Link} to="/" className="nav-logo">
            LM
          </Navbar.Brand>
          {/*<Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {/* Add your navigation links here }
            </Nav>
          </Navbar.Collapse> */}
      </Navbar>
      <Outlet />
    </>
  )
}

export default Layout