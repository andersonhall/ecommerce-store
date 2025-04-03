import "./Product.css";
import { Link } from "react-router";

const Product = (props) => {
  const { name, desc, image, price, id } = props;
  const productLink = `/store/product-details/${id}`;
  return (
    <div className="product">
      <Link to={productLink}>
        <img className="product-image" src={image} alt={name} />
      </Link>
      <h3 className="product-name">{name}</h3>
      <p className="product-desc">{desc}</p>
      <p className="product-price">{price}</p>
    </div>
  );
};

export default Product;
