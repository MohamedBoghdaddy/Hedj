import React, { useState } from 'react';
import Cart from "./cart";
import Kitemcard from "./Kitemcard";
import Card from 'react-bootstrap/Card'; // Make sure this import statement is correct
import Kitcard from './Kitcard';



const Kitchen =() =>{


   
    const [cart, setCart] = useState([]);

    const addToCart = (item) => {
        setCart([...cart, item]);
    };
    return(
        <div>
            <h1 className="textBed">BEDROOMS</h1>
      <section className="py-4 container" >

   

    <div className="row justify-content-center">
                {/* Pass addToCart function as a prop to Kitemcard */}
                <Kitemcard addToCart={addToCart} />
                
            






</div>
<h1 className='kitchencss'>KITCHENS</h1>
<div className="row justify-content-center">
                {/* Pass addToCart function as a prop to Kitemcard */}
                <Kitcard addToCart={addToCart} />
                <Cart cart={cart} />
            






</div>


      </section>
        </div>
    )
}


export default Kitchen;