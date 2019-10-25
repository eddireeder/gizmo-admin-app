import React from "react";
import "./Configuration.css";
import axios from "axios";
import { Redirect } from "react-router-dom";
import _ from "lodash";

class Configuration extends React.Component {
  constructor(props) {
    super(props);
    // Define initial state
    this.state = {
      authenticated: true,
      serverError: "",
      configuration: {
        primaryAngle: null,
        secondaryAngle: null,
        timeToFocus: null
      },
      formControls: {
        primaryAngle: null,
        secondaryAngle: null,
        timeToFocus: null
      }
    };
    // Bind functions to class
    this.changeHandler = this.changeHandler.bind(this);
    this.submitForm = this.submitForm.bind(this);
    this.canSubmit = this.canSubmit.bind(this);
  }

  async componentDidMount() {
    // Try to get configuration from the server
    const configuration = await this.getConfiguration();
    // Update starting form values and the configuration state
    if (configuration) {
      let newState = { ...this.state };
      newState.configuration = { ...configuration };
      newState.formControls = { ...configuration };
      this.setState(newState);
    }
  }

  async getConfiguration() {
    try {
      // Make GET request to the server
      const response = await axios.get(
        process.env.REACT_APP_API_URL + "/configuration"
      );
      // Return configuration
      return response.data.configuration;
    } catch (e) {
      // Update error message in state
      let newState = { ...this.state };
      newState.serverError = "Could not retrieve configuration from the server";
      this.setState(newState);
    }
  }

  async postConfiguration(configuration) {
    try {
      // Send POST request to server
      const response = await axios.post(
        process.env.REACT_APP_API_URL + "/configuration",
        configuration,
        {
          withCredentials: true
        }
      );
      if (response.status === 200) {
        // Remove error message and update configuration state
        let newState = { ...this.state };
        newState.serverError = "";
        newState.configuration = { ...configuration };
        this.setState(newState);
      }
    } catch (e) {
      // Log out if unauthorised if unauthorised
      if (e.response.status === 401) {
        this.logOut();
      } else {
        // Update error message in state
        let newState = { ...this.state };
        newState.serverError = "Could not send configuration to the server";
        this.setState(newState);
      }
    }
  }

  changeHandler(event) {
    // Retrieve form values from event
    const name = event.target.name;
    const value = event.target.value;
    // Update configuration state with values
    let newState = { ...this.state };
    newState.formControls[name] = value;
    this.setState(newState);
  }

  async submitForm(event) {
    // Prevent default form submission action
    event.preventDefault();
    // POST configuration from form to the server
    await this.postConfiguration(this.state.formControls);
  }

  logOut() {
    // Remove user object from local storage
    localStorage.removeItem("user");
    // Update state
    let newState = { ...this.state };
    newState.authenticated = false;
    this.setState(newState);
  }

  canSubmit() {
    // Check there are no null values
    for (const key in this.state.formControls) {
      if (
        this.state.formControls[key] == null ||
        this.state.formControls[key] === ""
      )
        return false;
    }
    if (_.isEqual(this.state.configuration, this.state.formControls)) {
      return false;
    }
    return true;
  }

  render() {
    // Redirect to if unauthorised
    if (!this.state.authenticated) {
      return <Redirect to="/"></Redirect>;
    }
    // Render Configuration component
    return (
      <div className="Configuration">
        <form onSubmit={this.submitForm}>
          <label>
            Primary Angle
            <input
              type="number"
              name="primaryAngle"
              defaultValue={
                this.state.configuration
                  ? this.state.configuration.primaryAngle
                  : null
              }
              onChange={this.changeHandler}
            />
          </label>
          <label>
            Secondary Angle
            <input
              type="number"
              name="secondaryAngle"
              defaultValue={
                this.state.configuration
                  ? this.state.configuration.secondaryAngle
                  : null
              }
              onChange={this.changeHandler}
            />
          </label>
          <label>
            Time to focus
            <input
              type="number"
              name="timeToFocus"
              defaultValue={
                this.state.configuration
                  ? this.state.configuration.timeToFocus
                  : null
              }
              onChange={this.changeHandler}
            />
          </label>
          <input type="submit" value="Save" disabled={!this.canSubmit()} />
        </form>
      </div>
    );
  }
}

export default Configuration;