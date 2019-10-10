import React from "react";
import "./App.css";
import { Redirect } from "react-router-dom";
import axios from "axios";

class App extends React.Component {
  constructor(props) {
    super(props);
    // Define initial state
    this.state = {
      user: JSON.parse(localStorage.getItem("user"))
    };
    // Bind function to class
    this.logout = this.logout.bind(this);
  }

  logout() {
    // Remove user object from local storage
    localStorage.removeItem("user");
    // Update state
    let newState = { ...this.state };
    newState.user = null;
    this.setState(newState);
  }

  async getSoundsCSV() {
    try {
      // Make GET request to the BBC
      const response = await axios.get(
        "http://bbcsfx.acropolis.org.uk/assets/BBCSoundEffects.csv"
      );
      if (response.status === 200) {
        // Parse the CSV response to JSON
      }
      console.log(response.data);
    } catch (e) {}
  }

  componentDidMount() {
    this.getSoundsCSV();
  }

  render() {
    // Redirect if not authenticated
    if (!this.state.user) {
      return <Redirect to="/login" />;
    }
    // Render App
    return (
      <div className="App">
        <div>{this.state.user.username}</div>
        <button onClick={this.logout}>Log out</button>
      </div>
    );
  }
}

export default App;
