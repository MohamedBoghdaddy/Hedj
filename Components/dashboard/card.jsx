import React from "react";
import { FaComment } from 'react-icons/fa';
import{BiMoney} from 'react-icons/bi';
import { AiOutlineDollarCircle, AiOutlineEye } from 'react-icons/ai';

const cards1=[
   
    {name:"Comments",number:"3000",icon:<FaComment />},
    {name:"Earnings",number:"50000$",icon:<BiMoney/>},
    {name:"Sales",number:"100$",icon:<AiOutlineDollarCircle/>},
    {name:"Views",number:"100",icon:<AiOutlineEye/>},
    
]
const card =()=>{
    return <div className="containerofcards">
        {cards1.map((item)=>(
            <div className="thecard">
                <div className="cardicon">{item.icon}</div>
                <div className="cardtitle">{item.name}</div>
                <div className="cardnum">{item.number}</div>
            </div>
        ))}
    </div>
};
export default card;