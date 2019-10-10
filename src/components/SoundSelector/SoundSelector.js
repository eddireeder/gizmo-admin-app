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
      serverError: ""
    };
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
    soundsFromBBC.forEach(soundFromBBC => {
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
      selectedSoundsfromServer.forEach(selectedSoundFromServer => {
        if (soundFromBBC.location == selectedSoundFromServer.location) {
          sound.selected = true;
          break;
        }
      });
      sounds.push(sound);
    });
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

  render() {
    // Render Sound Selector
    return <div className="SoundSelector"></div>;
  }
}

export default SoundSelector;
