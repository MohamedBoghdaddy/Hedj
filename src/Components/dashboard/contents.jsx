import Conheader from "./conheader";
import "../../Styles/contents.css";
import Report from "./report";
import Employeelist from "./employeelist";
import Customerslist from "./customerslist";




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