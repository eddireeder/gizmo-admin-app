import React from "react";
import ReactDOM from "react-dom";
import Configuration from "./Configuration";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<Configuration />, div);
  ReactDOM.unmountComponentAtNode(div);
});
