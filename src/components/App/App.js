import React from 'react';
import './App.css';
import {Redirect} from 'react-router-dom';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: JSON.parse(localStorage.getItem('user')),
    };
    this.logout = this.logout.bind(this)
  }

  logout() {
    localStorage.removeItem('user');
    let newState = {...this.state};
    newState.user = null;
    this.setState(newState);
  }

  render () {
    // Redirect if not authenticated
    if (!this.state.user) {
      return <Redirect to='/login'/>
    }

    return (
      <div className="App">
        <div>{this.state.user.username}</div>
        <button onClick={this.logout}>Log out</button>
      </div>
    );
  }
}

export default App;
