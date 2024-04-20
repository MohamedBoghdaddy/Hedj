import React from "react";
import Conheader from "./conheader";
import "../src/contents.css";
import Card from "./card";

const contents = ()=>{
  return <div className="content">
    <Conheader />
    <Card />
  </div>;
};
export default contents;