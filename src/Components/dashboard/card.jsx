import React from "react";
import { FaComment } from "react-icons/fa";
import { BiMoney } from "react-icons/bi";
import { AiOutlineDollarCircle, AiOutlineEye } from "react-icons/ai";

const cards1 = [
  { name: "Comments",  icon: <FaComment /> },
  { name: "Earnings", icon: <BiMoney /> },
  { name: "Sales",  icon: <AiOutlineDollarCircle /> }
  
];
const card = () => {
  return (
    <div className="containerofcards">
      {cards1.map((item) => (
        <div className="thecard">
          <div className="cardicon">{item.icon}</div>
          <div className="cardtitle">{item.name}</div>
          
        </div>
      ))}
    </div>
  );
};
export default card;
