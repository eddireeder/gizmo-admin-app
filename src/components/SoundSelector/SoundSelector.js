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
      },
      loading: true
    };
    // Bind functions to this class
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleOnlySelectedChange = this.handleOnlySelectedChange.bind(this);
    this.handleSelectedChange = this.handleSelectedChange.bind(this);
  }

  async componentDidMount() {
    this.refreshSounds();
  }

  async refreshSounds() {
    // Set loading state to true
    let newState = { ...this.state };
    newState.loading = true;
    this.setState(newState);
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
        id: null,
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
          sound.id = selectedSoundfromServer.id;
          sound.selected = true;
          break;
        }
      }
      sounds.push(sound);
    }
    // Update state
    newState = { ...this.state };
    newState.sounds = sounds;
    newState.loading = false;
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
        process.env.REACT_APP_API_URL + "/sounds"
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
    // Return an empty array if no filters chosen
    if (
      this.state.soundFilters.search.length === 0 &&
      !this.state.soundFilters.onlySelected
    ) {
      return [];
    }
    // Filter by soundFilters
    const lowercaseSearch = this.state.soundFilters.search.toLowerCase();
    return this.state.sounds.filter(sound => {
      // Filter by onlySelected
      if (this.state.soundFilters.onlySelected && !sound.selected) {
        return false;
      }
      // Filter by description search
      if (
        this.state.soundFilters.search.length > 0 &&
        sound.description.toLowerCase().indexOf(lowercaseSearch) === -1
      ) {
        return false;
      }
      return true;
    });
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
      // POST sound to the server
      const response = await axios.post(
        process.env.REACT_APP_API_URL + "/sounds",
        sound,
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
      this.setState(newState);
    }
  }

  async deselectSound(sound) {
    try {
      // Send DELETE request to the server
      const response = await axios.delete(
        process.env.REACT_APP_API_URL + "/sounds/" + sound.id,
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
      this.setState(newState);
    }
  }

  render() {
    // Render Sound Selector
    return (
      <div className="SoundSelector">
        <label>
          Search by description:
          <input type="text" name="search" onChange={this.handleSearchChange} />
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
                <th>CD Number</th>
                <th>CD Name</th>
                <th>Track Number</th>
                <th>Seconds</th>
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
                      <td>{sound.cdNumber}</td>
                      <td>{sound.cdName}</td>
                      <td>{sound.trackNumber}</td>
                      <td>{sound.secs}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={sound.selected}
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
