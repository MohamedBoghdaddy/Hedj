import { render, screen } from "@testing-library/react";
import from "react-router-dom"; // Correct context
import App from "./App";

test("renders learn react link", () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  ); // Wrap with the correct context
  const linkElement = screen.getByText(/learn react/i); // Test element retrieval
  expect(linkElement).toBeInTheDocument(); // Test expectation
});
