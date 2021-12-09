import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import Landing from './component/Landing';
import Profile from "./component/Profile";
import Home from "./component/Home";
import RegisterWithGoogle from "./component/RegisterWithGoogle";
import {Redirect} from "react-router";
import {isLoggedInAsCookie, isRegisteringWithGoogle} from "./util/Functions";


ReactDOM.render(
    <React.StrictMode>
        <Router>
            <Switch>
                <Route exact path="/" render={
                    () => {
                        if (isLoggedInAsCookie()) {
                            return <Redirect to="/home"/>;
                        } else {
                            return <Redirect to="/landing"/>;
                        }
                    }
                }/>

                <Route exact path="/landing" render={
                    () => {
                        if (isLoggedInAsCookie()) {
                            return <Redirect to="/home"/>;
                        } else {
                            return <Landing/>;
                        }
                    }
                }/>

                <Route exact path="/home" render={
                    () => {
                        if (isLoggedInAsCookie())  {
                            return <Home/>;
                        } else {
                            return <Redirect to="/landing"/>;
                        }
                    }
                }/>

                <Route exact path="/profile" render={
                    () => {
                        if (isLoggedInAsCookie()) {
                            return <Profile/>;
                        } else {
                            return <Redirect to="/landing"/>;
                        }
                    }
                }/>

                <Route exact path="/register_with_google" render={
                    () => {
                        if (isLoggedInAsCookie()) {
                            return <Redirect to="/home"/>;
                        } else if (!isRegisteringWithGoogle()) {
                            return <Redirect to="/landing"/>;
                        } else {
                            return <RegisterWithGoogle/>;
                        }
                    }
                }/>

            </Switch>
        </Router>
    </React.StrictMode>,
    document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
