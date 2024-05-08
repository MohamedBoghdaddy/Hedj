import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import dark from '../../assets/images/dark bedroom.jpg';
import "../../Styles/card.css";
import AddToFavorites from './Favorites';
import Grey from '../../assets/images/grey bedroom.jpg'
import modern from '../../assets/images/modern bedroom.jpg'
import Cart from './cart';

function Kitemcard({ addToCart }) {
    const handleAddToCart = () => {
        addToCart({
            name: 'Dark Bedroom',
            price: 18000,
            image: dark
        });
    };

    return (
        <div className='Container'>
            <div className="main-container">
                <div className="form-container">
                  
                    <div className='row1'>
                    <Card style={{ width: '18rem' }}>
                        <Card.Img className="image"
                            src={dark}
                            alt="Second slide"
                            style={{ width: '300px', height: 'auto' }}
                        />
                        <Card.Body>
                            <Card.Title>Dark Bedroom</Card.Title>
                            <Card.Text className="card-text">
                                Price : 18,000$
                            </Card.Text>
                            <Button variant="primary" onClick={handleAddToCart}>Add to Cart</Button>
                            <Link to="/Favourites">
                                <Button variant='primary'>Add to Favorites</Button>
                            </Link>                        </Card.Body>
                    </Card>


                    
                    <Card style={{ width: '18rem' }}>
                        <Card.Img className="image"
                            src={Grey}
                            alt="Second slide"
                            style={{ width: '300px', height: '333px' }}
                        />
                        <Card.Body>
                            <Card.Title>Grey Bedroom</Card.Title>
                            <Card.Text className="card-text">
                                Price : 20,000$
                            </Card.Text>
                            <Button variant="primary" onClick={handleAddToCart}>Add to Cart</Button>
                            <Button variant='primary' onClick={AddToFavorites}>Favorite</Button>
                        </Card.Body>
                    </Card>


              
                    <Card style={{ width: '18rem' }}>
                        <Card.Img className="image"
                            src={modern}
                            alt="Second slide"
                            style={{ width: '300px', height: '333px' }}
                        />
                        <Card.Body>
                            <Card.Title>Modern Bedroom</Card.Title>
                            <Card.Text className="card-text">
                                Price : 23,000$
                            </Card.Text>
                            <Button variant="primary" onClick={handleAddToCart}>Add to Cart</Button>
                            <Button variant='primary' onClick={AddToFavorites}>Favorite</Button>
                        </Card.Body>
                    </Card>
                    
                    ,/</div>

</div>
                 
            </div>

            </div>
        







        
       



    );
}

export default Kitemcard;
