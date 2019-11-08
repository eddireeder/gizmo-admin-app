import React from "react";
import "./Login.css";
import { Redirect } from "react-router-dom";
import axios from "axios";

class Login extends React.Component {
  constructor(props) {
    super(props);
    // Set component mounted
    this._isMounted = false;
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

  async componentDidMount() {
    // Set component mounted
    this._isMounted = true;
  }

  async componentWillUnmount() {
    // Set component mounted
    this._isMounted = false;
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
    // Remove any error message
    let newState = { ...this.state };
    newState.error = "";
    this.setState(newState);
    // Send log in request to the server
    try {
      const response = await axios.post(
        process.env.REACT_APP_API_URL + "/auth/login",
        {
          username: this.state.formControls.username,
          password: this.state.formControls.password
        },
        {
          withCredentials: true
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
      this._isMounted && this.setState(newState);
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
            className="input"
            type="text"
            placeholder="Username"
            name="username"
            onChange={this.changeHandler}
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            name="password"
            onChange={this.changeHandler}
          />
          {this.state.error.length > 0 && (
            <div className="error">{this.state.error}</div>
          )}
          <input className="input button" type="submit" value="Log in" />
        </form>
      </div>
    );
  }
}

export default Login;
