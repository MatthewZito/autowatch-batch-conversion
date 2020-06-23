import React, { Component } from "react";
import { connect } from "react-redux";

class App extends Component {
    render() {
        return (
            <div className="app">
                {this.props.children}
            </div>
        );
    }
}

export default connect()(App);
