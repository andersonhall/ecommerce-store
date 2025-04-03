import { logout } from "../utils/logout";
import ProductList from "../components/ProductList";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

const Store = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch("http://localhost:3000/products");
      const data = await response.json();
      setProducts(data);
    };
    fetchProducts();
  }, []);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <h1>Store</h1>
      <a href="/" onClick={handleLogout} alt="logout">
        Logout
      </a>

      <ProductList products={products} />
    </>
  );
};

export default Store;
