import "./Navbar.css";
import { Link } from "react-router";

const Navbar = () => {
  return (
    <nav>
      <h1>Ecommerce Store</h1>
      <ul>
        <li>
          <Link to="/register">Register</Link>
        </li>
        <li>
          <Link to="/login">Login</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
