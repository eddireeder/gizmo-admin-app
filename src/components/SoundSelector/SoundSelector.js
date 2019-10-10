import React from "react";
import "./SoundSelector.css";
import axios from "axios";
import csvtojson from "csvtojson";

class SoundSelector extends React.Component {
  constructor(props) {
    super(props);
    // Define initial state
    this.state = {
      sounds: [],
      bbcError: "",
      serverError: "",
      soundFilters: {
        search: "",
        onlySelected: false
      }
    };
    // Bind functions to this class
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleOnlySelectedChange = this.handleOnlySelectedChange.bind(this);
  }

  async componentDidMount() {
    // Retrieve all sounds and selected sounds
    const responses = await Promise.all([
      this.getSoundsFromBBC(),
      this.getSelectedSoundsFromServer()
    ]);
    const soundsFromBBC = responses[0];
    const selectedSoundsfromServer = responses[1];
    // Create a combined array by comparing the two arrays
    let sounds = [];
    for (const soundFromBBC of soundsFromBBC) {
      let sound = {
        location: soundFromBBC.location,
        description: soundFromBBC.description,
        category: soundFromBBC.category,
        cdNumber: soundFromBBC.CDNumber,
        cdName: soundFromBBC.CDName,
        trackNumber: soundFromBBC.tracknum,
        secs: soundFromBBC.secs,
        selected: false
      };
      // Check whether sound exists in selected sounds
      for (const selectedSoundfromServer of selectedSoundsfromServer) {
        if (soundFromBBC.location === selectedSoundfromServer.location) {
          sound.selected = true;
          break;
        }
      }
      sounds.push(sound);
    }
    // Update state
    let newState = { ...this.state };
    newState.sounds = sounds;
    this.setState(newState);
  }

  async getSoundsFromBBC() {
    try {
      // Make GET request to the BBC
      const response = await axios.get(
        "http://bbcsfx.acropolis.org.uk/assets/BBCSoundEffects.csv"
      );
      // Parse the CSV response to JSON then return
      return await csvtojson().fromString(response.data);
    } catch (e) {
      // Update error message in state
      let newState = { ...this.state };
      newState.bbcError = "Could not retrieve sounds from BBC";
      this.setState(newState);
    }
  }

  async getSelectedSoundsFromServer() {
    try {
      // Make GET request to the server
      const response = await axios.get(
        "http://ec2-3-8-216-213.eu-west-2.compute.amazonaws.com/api/sounds"
      );
      // Return the array of sounds
      return response.data.sounds;
    } catch (e) {
      // Update error message in state
      let newState = { ...this.state };
      newState.serverError = "Could not retrieve sounds from the server";
      this.setState(newState);
    }
  }

  handleSearchChange(event) {
    // Retrieve value from event
    const value = event.target.value;
    // Update state with new value
    let newState = { ...this.state };
    newState.soundFilters.search = value;
    this.setState(newState);
  }

  handleOnlySelectedChange(event) {
    // Retrieve value from event
    const value = event.target.checked;
    // Update state with new value
    let newState = { ...this.state };
    newState.soundFilters.onlySelected = value;
    this.setState(newState);
  }

  getFilteredSounds() {
    // If the search field contains characters
    if (this.state.soundFilters.search.length > 0) {
      const lowercaseSearch = this.state.soundFilters.search.toLowerCase();
      return this.state.sounds.filter(
        sound => sound.description.toLowerCase().indexOf(lowercaseSearch) !== -1
      );
    }
    return [];
  }

  render() {
    // Render Sound Selector
    return (
      <div className="SoundSelector">
        <input type="text" name="search" onChange={this.handleSearchChange} />
        <input
          type="checkbox"
          name="onlySelected"
          onChange={this.handleOnlySelectedChange}
        />
        {this.getFilteredSounds()
          .slice(0, 10)
          .map((sound, index) => {
            return (
              <div className="row" key={index}>
                <div>{sound.location}</div>
                <div>{sound.description}</div>
                <div>{sound.category}</div>
                <div>{sound.cdNumber}</div>
                <div>{sound.cdName}</div>
                <div>{sound.trackNumber}</div>
                <div>{sound.secs}</div>
                <div>{sound.selected}</div>
              </div>
            );
          })}
      </div>
    );
  }
}

export default SoundSelector;
