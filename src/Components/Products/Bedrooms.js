import React from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import AddToFavorites from "./Favorites";
import Grey from "../../Assets/Images/70.jpg";
import modern from "../../Assets/Images/73.jpg";
import double from "../../Assets/Images/74.jpg";
import "../../Styles/Products.css";

function Bedrooms({ addToCart }) {

  const handleAddToCart = (name, price) => {
    const item = { name, price, quantity: 1 }; // Define item to add
    addToCart(item); // Add item to the cart
  };


  return (
    <div className="Container">
      <div className="main-container">
        <div className="form-container">
          <div className="row1">
            <Card className="card">
              <Card.Img className="image" src={Grey} alt="Second slide" />
              <Card.Body>
                <Card.Title>modern Bedroom</Card.Title>
                <Card.Text className="card-text">Price : 18,000$</Card.Text>
                <Button className="button" onClick={handleAddToCart}>
                  Add to Cart
                </Button>
                <Link to="/Favourites">
                  <Button className="button">Add to Favorites</Button>
                </Link>{" "}
              </Card.Body>
            </Card>
            <Card className="card">
              <Card.Img className="image" src={modern} alt="Second slide" />
              <Card.Body>
                <Card.Title>Grey Bedroom</Card.Title>
                <Card.Text className="card-text">Price : 20,000$</Card.Text>
                <Button className="button" onClick={handleAddToCart}>
                  Add to Cart
                </Button>
                <Button className="button" onClick={AddToFavorites}>
                  Favorite
                </Button>
              </Card.Body>
            </Card>
            <Card className="card">
              <Card.Img className="image" src={double} alt="Second slide" />
              <Card.Body>
                <Card.Title>double Bedroom</Card.Title>
                <Card.Text className="card-text">Price : 23,000$</Card.Text>
                <Button className="button" onClick={handleAddToCart}>
                  Add to Cart
                </Button>
                <Button className="button" onClick={AddToFavorites}>
                  Favorite
                </Button>
              </Card.Body>
            </Card>
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default Bedrooms;
