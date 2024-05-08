import React from "react";
import { Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import kitchen1 from "../../Assets/Images/89.jpg";
import kitchen2 from "../../Assets/Images/90.jpg";
import kitchen3 from "../../Assets/Images/91.jpg";
import "../../Styles/Products.css"; // Import the CSS

function Kitcard({ addToCart }) {
  // const navigate = useNavigate(); // Hook to navigate to other routes

  const handleAddToCart = (item) => {
    addToCart(item);
    // navigate("/cart"); // Navigate to Cart when an item is added
  };
  return (
    <div className="Container">
      <div className="row1">
        {/* Card 1 */}
        <Card className="card">
          <Card.Img src={kitchen1} className="image" alt="Kitchen 1" />
          <Card.Body>
            <Card.Title>Mint Modern Kitchen</Card.Title>
            <Card.Text>Price: $30,000</Card.Text>
            <Button
              className="button"
              onClick={() => handleAddToCart("Mint Modern Kitchen", 30000)}
            >
              Add to Cart
            </Button>
            <Link to="/Favorites">
              <Button className="button">Add to Favorites</Button>
            </Link>
          </Card.Body>
        </Card>

        {/* Card 2 */}
        <Card className="card">
          <Card.Img src={kitchen2} className="image" alt="Kitchen 2" />
          <Card.Body>
            <Card.Title>Woody Kitchen</Card.Title>
            <Card.Text>Price: $60,000</Card.Text>
            <Button
              className="button"
              onClick={() => handleAddToCart("Woody Kitchen", 60000)}
            >
              Add to Cart
            </Button>
            <Button className="button">Favorite</Button>
          </Card.Body>
        </Card>

        {/* Card 3 */}
        <Card className="card">
          <Card.Img src={kitchen3} className="image" alt="Kitchen 3" />
          <Card.Body>
            <Card.Title>Marble Woody Kitchen</Card.Title>
            <Card.Text>Price: $23,000</Card.Text>
            <Button
              className="button"
              onClick={() => handleAddToCart("Marble Woody Kitchen", 23000)}
            >
              Add to Cart
            </Button>
            <Button className="button">Favorite</Button>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

export default Kitcard;
