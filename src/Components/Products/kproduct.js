import "../../Styles/Products.css";

const Kproduct = ({ product }) => {
  return (
    <div className="product-card">
      <img src={product.img} alt={product.title} />
      <h2>{product.title}</h2>
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
    </div>
  );
}

export default Kproduct;
