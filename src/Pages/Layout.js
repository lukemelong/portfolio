import '../Styles/Layout.scss'
import { Link, Outlet } from "react-router-dom"

function Layout() {

  return (
    <>
      <nav>
        <ul style={{ padding: 0 }}>
          <h1 className="nav-logo">LM</h1>
        </ul>
      </nav>
      <Outlet />
    </>
  )
}

export default Layout