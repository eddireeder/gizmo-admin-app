import React from "react";
import "./App.css";
import { Redirect } from "react-router-dom";
import SoundSelector from "./SoundSelector/SoundSelector";
import Configuration from "./Configuration/Configuration";

class App extends React.Component {
  constructor(props) {
    super(props);
    // Define initial state
    this.state = {
      user: JSON.parse(localStorage.getItem("user")),
      sounds: [],
      bbcError: "",
      serverError: ""
    };
    // Bind function to class
    this.logOut = this.logOut.bind(this);
  }

  logOut() {
    // Remove user object from local storage
    localStorage.removeItem("user");
    // Update state
    let newState = { ...this.state };
    newState.user = null;
    this.setState(newState);
  }

  render() {
    // Redirect if not authenticated
    if (!this.state.user) {
      return <Redirect to="/login"></Redirect>;
    }
    // Render App
    return (
      <div className="App">
        <div className="topbar">
          <div>{this.state.user.username}</div>
          <button className="logoutButton" onClick={this.logOut}>
            Log out
          </button>
        </div>
        <div className="main-content">
          <h2>Options</h2>
          <Configuration></Configuration>
          <div className="line"></div>
          <h2>Sound Selector</h2>
          <SoundSelector></SoundSelector>
        </div>
      </div>
    );
  }
}

export default App;
