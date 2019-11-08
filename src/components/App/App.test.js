import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter, Route } from "react-router-dom";

it("renders without crashing", () => {
  const div = document.createElement("div");
  // Render app inside a router
  const routing = (
    <BrowserRouter>
      <Route component={App} />
    </BrowserRouter>
  );
  ReactDOM.render(routing, div);
  ReactDOM.unmountComponentAtNode(div);
});
