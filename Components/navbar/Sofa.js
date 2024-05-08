import React, { useState } from 'react';
import Cart from "./cart";
import Kitemcard from "./Kitemcard";

const Sofa =() =>{
     
    const [cart, setCart] = useState([]);

    const addToCart = (item) => {
        setCart([...cart, item]);
    };

    return(
        <div>
              
        </div>
    )
}


export default Sofa;