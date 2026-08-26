import React, {Component} from "react";
import {Router} from "react-router-dom";
import history from "./history";
import "./App.css";
import Home from "./Home";

class App extends Component {
    constructor() {
        super();
        // start in a state of loading
        this.state = {
            "loading": true,
        };
    }

    componentDidMount() {
        // simulate async action and remove loader
        setTimeout(() => this.setState({"loading": false}), 1500);
    }

    render() {
        return (
            <div className="App" >
                <Router history={history}>
                    <Home/>
                </Router>
            </div>
        );
    }
}

export default App;
