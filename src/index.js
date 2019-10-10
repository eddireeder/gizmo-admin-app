import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {Route, BrowserRouter, Redirect} from 'react-router-dom';
import App from './components/App/App';
import * as serviceWorker from './serviceWorker';
import Login from './components/Login/Login';

const PrivateRoute = ({component: Component, ...rest}) => (
  <Route {...rest} render = {
    props => (localStorage.getItem('user') ? <Component {...props}/> : <Redirect to={{pathname: '/login', state: {from: props.location}}}/>)
  }/>
);

const NotLoggedInRoute = ({component: Component, ...rest}) => (
  <Route {...rest} render = {
    props => (localStorage.getItem('user') ? <Redirect to={{pathname: '/', state: {from: props.location}}}/> : <Component {...props}/>)
  }/>
);

const routing = (
  <BrowserRouter>
    <NotLoggedInRoute exact path="/login" component={Login}/>
    <PrivateRoute exact path="/" component={App}/>
  </BrowserRouter>
)

ReactDOM.render(routing, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
