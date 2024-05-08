import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../Styles/main.css';
import Cart from "./cart";
import Kitemcard from "./Kitemcard"; // Make sure to import Kitemcard component
import AddToFavorites from './Favorites';

const Main = () => {
    

    return (
        <div className='navbar'>
           

            
            <div className='container'>
                <ul className='navvbar' >
                    <li><Link to="/Products">Products</Link></li>
                    <li><Link to="/Cart">Cart</Link></li>
                    
                </ul>
            </div>
           
        </div>
    );
};

export default Main;
