import React from "react";
import "../../Styles/Navbar.css";
import SearchResult from "./SearchResult";

function SearchResultsList({ results }) {
  return (
    <div className="results-list">
      {results.map((result, id) => (
        <SearchResult result={result} key={id} />
      ))}
    </div>
  );
}

export default SearchResultsList;
