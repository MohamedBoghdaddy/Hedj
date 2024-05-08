import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import "../../Styles/card.css";
import AddToFavorites from './Favorites';
import kitchen1 from '../../assets/images/kitchen1.jpg'
import kitchen2 from '../../assets/images/kitchen2.jpg'
import kitchen3 from '../../assets/images/kitchen3.jpg'
import dark from '../../assets/images/dark bedroom.jpg';


function Kitcard({ addToCart }) {
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
                            src={kitchen1}
                            alt="Second slide"
                            style={{ width: '300px', height: '333px' }}
                        />
                        <Card.Body>
                            <Card.Title>Mint Modern Kitchen</Card.Title>
                            <Card.Text className="card-text">
                                Price : 30,000$
                            </Card.Text>
                            <Button variant="primary" onClick={handleAddToCart}>Add to Cart</Button>
                            <Link to="/Favourites">
                                <Button variant='primary'>Add to Favorites</Button>
                            </Link>                        </Card.Body>
                    </Card>



                
                    <Card style={{ width: '18rem' }}>
                        <Card.Img className="image"
                            src={kitchen2}
                            alt="Second slide"
                            style={{ width: '300px', height: '333px' }}
                        />
                        <Card.Body>
                            <Card.Title>Woody Kitchen</Card.Title>
                            <Card.Text className="card-text">
                                Price : 60,000$
                            </Card.Text>
                            <Link to="/Cart">
                                <Button variant='primary'>Add to CART</Button>
                            </Link>
                            <Button variant='primary' onClick={AddToFavorites}>Favorite</Button>
                        </Card.Body>
                    </Card>



                    <Card style={{ width: '18rem' }}>
                        <Card.Img className="image"
                            src={kitchen3}
                            alt="Second slide"
                            style={{ width: '300px', height: '333px' }}
                        />
                        <Card.Body>
                            <Card.Title>Marble Woody Kitchen </Card.Title>
                            <Card.Text className="card-text">
                                Price : 23,000$
                            </Card.Text>
                            <Button variant="primary" onClick={handleAddToCart}>Add to Cart</Button>
                            <Button variant='primary' onClick={AddToFavorites}>Favorite</Button>
                        </Card.Body>
                    </Card>

</div>
                 
            </div>
            </div>
        

</div>





        
       



    );
}

export default Kitcard;
