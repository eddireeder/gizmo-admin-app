import React from "react";
import "./SoundSelector.css";
import axios from "axios";
import csvtojson from "csvtojson";
import config from "../../../config";

class SoundSelector extends React.Component {
  constructor(props) {
    super(props);
    // Set component mounted
    this._isMounted = false;
    // Define initial state
    this.state = {
      sounds: [],
      bbcError: "",
      serverError: "",
      soundFilters: {
        locationSearch: "",
        descriptionSearch: "",
        onlyOnPhone: false,
        onlySelected: false
      },
      loading: true
    };
    // Bind functions to this class
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleOnlyOnPhoneChange = this.handleOnlyOnPhoneChange.bind(this);
    this.handleOnlySelectedChange = this.handleOnlySelectedChange.bind(this);
    this.handleSelectedChange = this.handleSelectedChange.bind(this);
  }

  async componentDidMount() {
    // Set component mounted
    this._isMounted = true;
    // Refresh sound list
    this.refreshSounds();
  }

  async componentWillUnmount() {
    // Set component mounted
    this._isMounted = false;
  }

  async refreshSounds() {
    // Set loading state to true
    let newState = { ...this.state };
    newState.loading = true;
    this.setState(newState);
    // Retrieve all sounds and downloaded sounds
    const responses = await Promise.all([
      this.getSoundsFromBBC(),
      this.getSoundsOnPhoneFromServer()
    ]);
    const soundsFromBBC = responses[0];
    const soundsOnPhoneFromServer = responses[1];
    // Create a combined array by comparing the two arrays
    let sounds = [];
    for (const soundFromBBC of soundsFromBBC) {
      let sound = {
        id: null,
        location: soundFromBBC.location,
        description: soundFromBBC.description,
        category: soundFromBBC.category,
        cdNumber: soundFromBBC.CDNumber,
        cdName: soundFromBBC.CDName,
        trackNumber: soundFromBBC.tracknum,
        secs: soundFromBBC.secs,
        onPhone: false,
        selected: false
      };
      // Check whether sound exists in sounds on phone
      for (const soundOnPhoneFromServer of soundsOnPhoneFromServer) {
        if (soundFromBBC.location === soundOnPhoneFromServer.location) {
          sound.id = soundOnPhoneFromServer.id;
          sound.onPhone = true;
          sound.selected = soundOnPhoneFromServer.selected;
          break;
        }
      }
      sounds.push(sound);
    }
    // Update state
    newState = { ...this.state };
    newState.sounds = sounds;
    newState.loading = false;
    this._isMounted && this.setState(newState);
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
      this._isMounted && this.setState(newState);
    }
  }

  async getSoundsOnPhoneFromServer() {
    try {
      // Make GET request to the server
      const response = await axios.get(config.apiUrl + "/sounds");
      // Return the array of sounds
      return response.data.sounds;
    } catch (e) {
      // Update error message in state
      let newState = { ...this.state };
      newState.serverError = "Could not retrieve sounds from the server";
      this._isMounted && this.setState(newState);
    }
  }

  handleSearchChange(event) {
    // Retrieve name and value from event
    const value = event.target.value;
    const name = event.target.name;
    // Update state with new value
    let newState = { ...this.state };
    newState.soundFilters[name] = value;
    this.setState(newState);
  }

  handleOnlyOnPhoneChange(event) {
    // Retrieve value from event
    const value = event.target.checked;
    // Update state with new value
    let newState = { ...this.state };
    newState.soundFilters.onlyOnPhone = value;
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
    // Filter by soundFilters
    const lowercaseLocationSearch = this.state.soundFilters.locationSearch.toLowerCase();
    const lowercaseDescriptionSearch = this.state.soundFilters.descriptionSearch.toLowerCase();
    return this.state.sounds.filter(sound => {
      // Filter by onlyOnPhone
      if (this.state.soundFilters.onlyOnPhone && !sound.onPhone) return false;
      // Filter by onlySelected
      if (this.state.soundFilters.onlySelected && !sound.selected) return false;
      // Filter by location search
      if (
        lowercaseLocationSearch.length > 0 &&
        sound.location.toLowerCase().indexOf(lowercaseLocationSearch) === -1
      ) {
        return false;
      }
      // Filter by description search
      if (
        lowercaseDescriptionSearch.length > 0 &&
        sound.description.toLowerCase().indexOf(lowercaseDescriptionSearch) ===
          -1
      ) {
        return false;
      }
      return true;
    });
  }

  handleOnPhoneChange(event, sound) {
    // Retrieve value from event
    const value = event.target.checked;
    if (value) {
      this.setOnPhone(sound);
    } else {
      this.setNotOnPhone(sound);
    }
  }

  async setOnPhone(sound) {
    try {
      // POST sound to the server
      const response = await axios.post(config.apiUrl + "/sounds", sound, {
        withCredentials: true
      });
      if (response.status === 200) {
        // Refresh the list of sounds
        this.refreshSounds();
      }
    } catch (e) {
      // Update error message in state
      let newState = { ...this.state };
      newState.serverError = "Could not set on phone";
      this._isMounted && this.setState(newState);
    }
  }

  async setNotOnPhone(sound) {
    try {
      // Send DELETE request to the server
      const response = await axios.delete(
        config.apiUrl + "/sounds/" + sound.id,
        {
          withCredentials: true
        }
      );
      if (response.status === 200) {
        // Refresh the list of sounds
        this.refreshSounds();
      }
    } catch (e) {
      // Update error message in the state
      let newState = { ...this.state };
      newState.serverError = "Could not set not on phone";
      this._isMounted && this.setState(newState);
    }
  }

  handleSelectedChange(event, sound) {
    // Retrieve value from event
    const value = event.target.checked;
    if (value) {
      this.selectSound(sound);
    } else {
      this.deselectSound(sound);
    }
  }

  async selectSound(sound) {
    try {
      // POST select sound
      const response = await axios.post(
        config.apiUrl + "/sounds/" + sound.id + "/select",
        {},
        {
          withCredentials: true
        }
      );
      if (response.status === 200) {
        // Refresh the list of sounds
        this.refreshSounds();
      }
    } catch (e) {
      // Update error message in state
      let newState = { ...this.state };
      newState.serverError = "Could not select sound";
      this._isMounted && this.setState(newState);
    }
  }

  async deselectSound(sound) {
    try {
      // POST deselect sound
      const response = await axios.post(
        config.apiUrl + "/sounds/" + sound.id + "/deselect",
        {},
        {
          withCredentials: true
        }
      );
      if (response.status === 200) {
        // Refresh the list of sounds
        this.refreshSounds();
      }
    } catch (e) {
      // Update error message in the state
      let newState = { ...this.state };
      newState.serverError = "Could not deselect sound";
      this._isMounted && this.setState(newState);
    }
  }

  render() {
    // Render Sound Selector
    return (
      <div className="SoundSelector">
        <label>
          Search by location:
          <input
            className="input"
            type="text"
            name="locationSearch"
            onChange={this.handleSearchChange}
          />
        </label>
        <label>
          Search by description:
          <input
            className="input"
            type="text"
            name="descriptionSearch"
            onChange={this.handleSearchChange}
          />
        </label>
        <label>
          Show only on phone:
          <input
            type="checkbox"
            name="onlyOnPhone"
            onChange={this.handleOnlyOnPhoneChange}
          />
        </label>
        <label>
          Show only selected:
          <input
            type="checkbox"
            name="onlySelected"
            onChange={this.handleOnlySelectedChange}
          />
        </label>
        {this.state.loading ? (
          <div>Loading</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Location</th>
                <th>Description</th>
                <th>Category</th>
                <th>Seconds</th>
                <th>Downloaded to phone</th>
                <th>Selected</th>
              </tr>
            </thead>
            <tbody>
              {this.getFilteredSounds()
                .slice(0, 10)
                .map((sound, index) => {
                  return (
                    <tr key={index}>
                      <td>{sound.location}</td>
                      <td>{sound.description}</td>
                      <td>{sound.category}</td>
                      <td>{sound.secs}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={sound.onPhone}
                          onChange={e => this.handleOnPhoneChange(e, sound)}
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={sound.selected}
                          disabled={!sound.onPhone}
                          onChange={e => this.handleSelectedChange(e, sound)}
                        />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
      </div>
    );
  }
}

export default SoundSelector;
