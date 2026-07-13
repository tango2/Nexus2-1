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
            "searchMode": "text",
        };
    }

    render() {
        const {inputValue, searchMode} = this.state;
        return (
            <form
                className="SearchComponent"
                onSubmit={(event) => {
                    event.preventDefault();
                    if (searchMode === "text") {
                        this.props.actions.searchText(inputValue);
                    } else {
                        this.props.actions.searchPublicationInfo(inputValue);
                    }
                }}>
                <input
                    type="text"
                    aria-label={searchMode === "text" ? "Search in story text" : "Search by publication info"}
                    placeholder={searchMode === "text" ? "Search in story text" : "e.g. DS_II_D_5"}
                    style={{caretColor: "white"}}
                    value={inputValue}
                    onChange={(event) => {
                        this.setState({"inputValue": event.target.value});
                    }} />
                <div className="search-mode-radios">
                    <label>
                        <input
                            type="radio"
                            name="searchMode"
                            value="text"
                            checked={searchMode === "text"}
                            onChange={() => this.setState({"searchMode": "text"})} />
                        Search in all text
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="searchMode"
                            value="publication"
                            checked={searchMode === "publication"}
                            onChange={() => this.setState({"searchMode": "publication"})} />
                        Search by publication info
                    </label>
                </div>
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
