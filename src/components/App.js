import React, { useEffect, useState } from 'react';
import { Route, Switch, Redirect, useHistory } from 'react-router-dom';
import Login from './Login.js';
import Register from './Register.js';
import MyProfile from './MyProfile.js';
import ProtectedRoute from './ProtectedRoute';
import * as duckAuth from '../duckAuth.js';
import './styles/App.css';
import NavBar from "./NavBar";
import DuckList from "./DuckList";

const App = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);

    const history = useHistory();

    useEffect(() => {
        tokenCheck();
    }, []);

    useEffect(() => {
        if (loggedIn) {
            history.push("/ducks");
            return;
        }
        history.push('/register');
    }, [loggedIn]);

    const handleLogin = (username, password) => {
        return duckAuth
            .authorize(username, password)
            .then((data) => {
                if (!data.jwt) {
                    return;
                }
                localStorage.setItem('jwt', data.jwt);
                setUserData({
                    username: data.user.username,
                    email: data.user.email
                });
                setLoggedIn(true)
            });
    }

    const handleRegister = (username, password, email) => {
        return duckAuth
            .register(username, password, email)
            .then(() => {
                history.push('/login');
            });
    }

    const tokenCheck = () => {
        if (localStorage.getItem('jwt')) {
            let jwt = localStorage.getItem('jwt');
            duckAuth.getContent(jwt).then((res) => {
                if (res) {
                    setUserData({
                        username: res.username,
                        email: res.email
                    });
                    setLoggedIn(true);
                }
            });
        }
    }

    const handleSignOut = () => {
        localStorage.removeItem('jwt');
        setLoggedIn(false);
    }

    return (
        <Switch>
            <ProtectedRoute path="/ducks" loggedIn={loggedIn} >
                <NavBar handleSignOut={handleSignOut} />
                <DuckList />
            </ProtectedRoute>
            <ProtectedRoute path="/my-profile" loggedIn={loggedIn}>
                <MyProfile userData={userData} handleSignOut={handleSignOut} />
            </ProtectedRoute>
            <Route path="/login">
                <div className="loginContainer">
                    <Login handleLogin={handleLogin} tokenCheck={tokenCheck} />
                </div>
            </Route>
            <Route path="/register">
                <div className="registerContainer">
                    <Register handleRegister={handleRegister} />
                </div>
            </Route>
            <Route>
                {loggedIn ? <Redirect to="/ducks" /> : <Redirect to="/login" />}
            </Route>
        </Switch>
    )
}

export default App;