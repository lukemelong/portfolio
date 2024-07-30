import '../Styles/Layout.scss'
import { Link, Outlet } from "react-router-dom"

function Layout() {

  return (
    <>
      <nav>
        <Link to='/'>
          <h1 className='nav-logo'>LM</h1>
        </Link>
        <ul>
          <li>
            <Link to='/'>Home</Link>
          </li>
          <li>
            <Link to='/About'>About</Link>
          </li>
          <li>
            <Link to='/Projects'>Projects</Link>
          </li>
          <li>
            <Link to='/Contact'>Contact</Link>
          </li>
        </ul>
      </nav>
      <Outlet />
    </>
  )
}

export default Layout