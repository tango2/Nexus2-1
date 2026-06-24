import React, {Component} from "react";
import "./search.css";
import PropTypes from "prop-types";
import {bindActionCreators} from "redux";
import * as searchActions from "../../actions/searchActions";
import connect from "react-redux/es/connect/connect";

class SearchComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            "inputValue": "",
        };
    }

    render() {
        return (
            <form
                className="SearchComponent"
                onSubmit={(event) => {
                    event.preventDefault();
                    this.props.actions.searchText(this.state.inputValue);
                }}>
                <input
                    type="text"
                    placeholder="Search in story text"
                    style={{caretColor: "white"}}
                    value={this.state.inputValue}
                    onChange={(event) => {
                        this.setState({"inputValue": event.target.value});
                    }} />
            </form>
        );
    }
}

SearchComponent.propTypes = {
    "actions": PropTypes.object.isRequired,
};

function mapStateToProps() {
    return {};
}

function mapDispatchToProps(dispatch) {
    return {
        "actions": bindActionCreators(searchActions, dispatch),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SearchComponent);
