import React from "react";
import ReactDOM from "react-dom";
import Login from "./Login";
import { render, fireEvent, wait } from "@testing-library/react";
import axios from "axios";

// Mock out axios
jest.mock("axios");

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<Login />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it("sends post request on form submit", () => {
  // Render component
  const { container } = render(<Login />);
  // Mock axios and do nothing
  axios.post.mockImplementationOnce(() => null);

  // Retrieve DOM node for submit button
  const submitNode = container.querySelector('input[type="submit"]');
  // Click button
  fireEvent.click(submitNode);

  // Assert post method to have been called once
  expect(axios.post).toHaveBeenCalledTimes(1);
});

it("redirects on successful log in", async () => {
  // Render component
  const { container } = render(<Login />);
  // Clear previous mock activity with axios
  axios.post.mockClear();
  // Mock axios and resolve with a 200 response
  axios.post.mockResolvedValueOnce({ status: 200 });

  // Retrieve DOM node for submit button
  const submitNode = container.querySelector('input[type="submit"]');
  // Click button
  fireEvent.click(submitNode);
});

it("displays network error message on failed log in with no response", async () => {
  // Render component
  const { container, getByText } = render(<Login />);
  // Clear previous mock activity with axios
  axios.post.mockClear();
  // Mock axios and reject promise with no response
  axios.post.mockRejectedValueOnce({});

  // Retrieve DOM node for submit button
  const submitNode = container.querySelector('input[type="submit"]');
  // Click button
  fireEvent.click(submitNode);

  // Assert post method was called once
  expect(axios.post).toHaveBeenCalledTimes(1);
  // Wait until timeout
  await wait(() => {
    // Find error message in DOM
    const errorMessageNode = getByText("There was a network error");
    // Assert error message exists
    expect(errorMessageNode).toBeDefined();
  });
});

it.todo("sets user object in local storage on successful log in");

it.todo("sets state authenticated value to true on successful log in");

it.todo("renders a redirect when state authenticated value is true");
