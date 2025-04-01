import "./Product.css";

const Product = (props) => {
  const { name, desc, image, price } = props;
  return (
    <div className="product">
      <img className="product-image" src={image} alt={name} />
      <h3 className="product-name">{name}</h3>
      <p className="product-desc">{desc}</p>
      <p className="product-price">{price}</p>
    </div>
  );
};

export default Product;
