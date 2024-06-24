import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
// import Kitcard from "./Kitchen"
import "../../Styles/Products.css";
import axios from 'axios';
import { AiOutlinedEdit } from "react-icons/ai";

const ProductsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };



const ShowProducts =() =>{
  const [product, setProduct] = useState([]);
    const [loading, setLoading] =useState(false);
    const {id} = useParams();
    useEffect (() => {
    setLoading(true);
    axios
    .get("http://localhost:3000/Products")
    .then((response) => {
      setProduct (response. data.data);
    setLoading(false);

    })
    .catch((error)=>{
      console.log(error);
      setLoading(false);
    })
    })
  }




const CreateProducts=()=>{
const[name,setName]=useState('');
const[description,seDescription]=useState('');
const[category,setCategory]=useState('');
const[price,setPrice]=useState('');
const[images,setImages]=useState('');
const [loading,setLoading]=useState(false);
const navigate= useNavigate();
const handleSaveProduct = () =>{
const data ={
  name,
  description,
  category,
  price,
  images,
};
setLoading(true);
axios
.post('http://localhost:3000/Products/${id}', data)
.then(() => {
  setLoading(false);
  navigate('/');
})
.catch((error) =>{
  setLoading(false);
  alert('An error happend plz check the console');
  console.log(error);
})
}

}


const EditProduct =() =>{
  const[name,setName]=useState('');
const[description,setDescription]=useState('');
const[category,setCategory]=useState('');
const[price,setPrice]=useState('');
const[images,setImages]=useState('');
const [loading,setLoading]=useState(false);
const navigate= useNavigate();
const{id}= useParams();
useEffect(()=> {
  setLoading(true);
  axios
.post('http://localhost:3000/Products/${id}', data)
.then((response) => {
  setDescription(response.data.description);
  setName(response.data.name);
  setCategory(response.data.category);
  setPrice(response.data.price);
  setImages(response.data.images);
  setLoading(false);
}).catch((error) =>{
  setLoading(false);
  alert('An error happend plz check the console');
  console.log(error);
})

})

}
}
const DeleteProduct =() => {
  const [loading,setLoading]=useState(false);
  const navigate =useNavigate();
  const {id} = useParams();
  const handleDeleteProducts = () => {
    setLoading(true);
    axios
    .delete('http://localhost:3000/Products/${id}')
    .then(() =>{
      setLoading(false);
      navigate('/')
    })
    .catch((error) => {
      setLoading(false);
      alert('An error happend check console');
      console.log(error);

    })
  }
}





  return (
    <div className="dropdown">
      <button onClick={toggleDropdown} className="dropdown-toggle">
        Products
      </button>
      <div className={`dropdown-menu ${isOpen ? "show" : ""}`}>
        <Link to="/news2024" className="dropdown-item">
          NEWS 2024
        </Link>
        <Link to="/kitchen" className="dropdown-item">
          KITCHEN
        </Link>
        <Link to="/systems" className="dropdown-item">
          SYSTEMS
        </Link>
        <Link to="/sofas" className="dropdown-item">
          SOFAS
        </Link>
        <Link to="/day-complements" className="dropdown-item">
          DAY COMPLEMENTS
        </Link>
        <Link to="/night-complements" className="dropdown-item">
          NIGHT COMPLEMENTS
        </Link>
        <Link to="/outdoor" className="dropdown-item">
          OUTDOOR
        </Link>
      </div>
      <div className="products-container">
        {/* Include Kitcard to display kitchen products */}
      </div>

    </div>
  );


export default ProductsDropdown;
