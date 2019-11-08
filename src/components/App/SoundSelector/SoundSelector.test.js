import React from "react";
import ReactDOM from "react-dom";
import SoundSelector from "./SoundSelector";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<SoundSelector />, div);
  ReactDOM.unmountComponentAtNode(div);
});
