import "../../Styles/Navbar.css";

function SearchResult({ result }) {
  return (
    <div className="search-result">
      <p>{result.products}</p>
    </div>
  );
}

export default SearchResult;
