import Product from "./Product";
import "./ProductList.css";

const ProductList = (props) => {
  const { products } = props;
  return (
    <div>
      <h1>Products</h1>
      <div className="product-list">
        {products.map((product) => {
          const { id, product_name, product_desc, product_image, price } =
            product;
          return (
            <Product
              name={product_name}
              desc={product_desc}
              image={product_image || "https://placehold.co/250x250"}
              price={price}
              key={id}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProductList;
