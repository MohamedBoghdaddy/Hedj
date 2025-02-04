import Conheader from "./conheader";
import "../../Styles/contents.css";
import Report from "./report";
import Employeelist from "./employeelist";
import Customerslist from "./customerslist";
import Footer from '../Homepage/Footer'; // Adjust the path as needed




const contents = ()=>{
  return (
    <div className="content">
      <Conheader />
      <Employeelist />
      <Customerslist />
      <Report />

    </div>
  );
};
export default contents;