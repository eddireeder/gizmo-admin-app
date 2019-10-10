import React from "react";
import "./Login.css";
import { Redirect } from "react-router-dom";
import axios from "axios";

class Login extends React.Component {
  constructor(props) {
    super(props);
    // Define state
    this.state = {
      formControls: {
        username: "",
        password: ""
      },
      authenticated: false,
      error: ""
    };
    // Bind functions to class
    this.changeHandler = this.changeHandler.bind(this);
    this.submitForm = this.submitForm.bind(this);
  }

  changeHandler(event) {
    // Retrieve form values from event
    const name = event.target.name;
    const value = event.target.value;
    // Update state with values
    let newState = { ...this.state };
    newState.formControls[name] = value;
    this.setState(newState);
  }

  async submitForm(event) {
    // Prevent default form submission action
    event.preventDefault();
    // Send log in request to the server
    try {
      const response = await axios.post(
        "http://ec2-3-8-216-213.eu-west-2.compute.amazonaws.com/api/auth/login",
        {
          username: this.state.formControls.username,
          password: this.state.formControls.password
        }
      );
      // On success, place the returned user object in local storage
      if (response.status === 200) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        let newState = { ...this.state };
        newState.authenticated = true;
        this.setState(newState);
      }
    } catch (e) {
      // Handle error by updating error message
      let message;
      if (!e.response) {
        message = "There was a network error";
      } else if (e.response.status === 400) {
        message = "Username and password are required";
      } else if (e.response.status === 401) {
        message = "Couldn't log in with username/password";
      } else {
        message = "Something went wrong, try again later";
      }
      // Update state
      let newState = { ...this.state };
      newState.error = message;
      this.setState(newState);
    }
  }

  render() {
    // Redirect to app when authenticated
    if (this.state.authenticated === true) {
      return <Redirect to="/"></Redirect>;
    }
    // Render login page
    return (
      <div className="Login">
        <form onSubmit={this.submitForm}>
          <input
            type="text"
            placeholder="Username"
            name="username"
            onChange={this.changeHandler}
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            onChange={this.changeHandler}
          />
          <input type="submit" value="Log in" />
        </form>
      </div>
    );
  }
}

export default Login;
