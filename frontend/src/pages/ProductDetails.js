import { useParams } from "react-router";
import { useState, useEffect } from "react";
import "./ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({});

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch("http://localhost:3000/products/" + id);
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        const data = await response.json();
        setProduct(data[0]);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    fetchProduct();
  }, [id]);

  const { product_name, product_desc, product_image, price, quantity } =
    product;

  const addToCart = () => {};

  return (
    <div className="product-details">
      <h1 className="product-name">{product_name}</h1>
      <img
        className="product-image"
        src={product_image || "https://placehold.co/250x250"}
        alt={product_name}
      />
      <p className="product-desc">{product_desc}</p>
      <p className="price">{price}</p>
      <button onClick={addToCart}>Add to Cart</button>
      <p className="quantity">In stock: {quantity}</p>
    </div>
  );
};

export default ProductDetails;
