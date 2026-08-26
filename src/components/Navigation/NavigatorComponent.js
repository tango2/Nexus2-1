import React, {Component} from "react";
import "./navigatorComponent.css";
import NavigationDropdownMenu from "./NavigationDropdownMenu";
import {arrayTransformation} from "../../utils";
import {getList, ontologyToDisplayKey, tangoTypes} from "../../data-stores/DisplayArtifactModel";
import PropTypes from "prop-types";
import {getSessionStorage, setSessionStorage} from "../../data-stores/SessionStorageModel";
import * as navigatorActions from "../../actions/navigatorActions";
import * as searchActions from "../../actions/searchActions";
import {bindActionCreators} from "redux";
import connect from "react-redux/es/connect/connect";

// tools listed in the Macroscope panel; exported so URL deep-links can resolve a tool id back to its name
export const MACROSCOPE_TOOLS = [
    {id: "witchhunter", name: "WitchHunter & TrollFinder", desc: "Geo-map ETK story categories; bounding-box keyword search"},
    {id: "ghostscope", name: "GhostScope & TreasureX", desc: "Conceptual geographies and directional movement vectors"},
    {id: "elfyelp", name: "ElfYelp", desc: "LDA geo-topics across the ETK collection"},
];

class Navigation extends Component {
    constructor(props) {
        super(props);
        // options for the three navigator panels
        this.dataNav = ["People", "Places", "Stories"];
        this.TINav = ["ETK Index", "Tangherlini Index", "Fieldtrips", "Genres"];
        this.macroscopeNav = MACROSCOPE_TOOLS;
        // initial state, further defined later
        this.state = {
            // which of the subclasses is currently active
            "activeList": null,
            // whether the data navigator or TI navigator is shown
            "dataNavView": true,
            // whether the macroscope panel is shown
            "macroscopeView": false,
            // submenus to show (for TI navigator)
            "dropdownLists": [],
            // navigators to render
            "navigators": [
                {"name": "Data Navigator", "tabClass": "tab cell medium-4 dataNavView"},
                {"name": "Topic & Index Navigator", "tabClass": "tab cell medium-4 TINavView"},
                {"name": "Macroscope", "tabClass": "tab cell medium-4 macroscopeView"},
            ],
        };
        // restore full navigator state saved on last unmount (covers tab, activeList, dropdowns)
        const savedState = getSessionStorage("navigatorComponentState");
        if (savedState) {
            this.state = {
                ...this.state,
                ...savedState,
            };
        } else {
            // first-ever load: fall back to SelectedNavOntology heuristic
            const {data} = getSessionStorage("SelectedNavOntology") || {"data": "Stories"};
            if (this.TINav.includes(data)) {
                this.state = {
                    ...this.state,
                    "dataNavView": false,
                    "navigators": [
                        {"name": "Data Navigator", "tabClass": "tab cell medium-4 dataNavView"},
                        {"name": "Topic & Index Navigator", "tabClass": "tab cell medium-4 TINavView active"},
                        {"name": "Macroscope", "tabClass": "tab cell medium-4 macroscopeView"},
                    ],
                    "path": ["Topic & Index Navigator"],
                };
            } else {
                this.state = {
                    ...this.state,
                    "dataNavView": true,
                    "navigators": [
                        {"name": "Data Navigator", "tabClass": "tab cell medium-4 dataNavView active"},
                        {"name": "Topic & Index Navigator", "tabClass": "tab cell medium-4 TINavView"},
                        {"name": "Macroscope", "tabClass": "tab cell medium-4 macroscopeView"},
                    ],
                    "path": ["Data Navigator"],
                };
            }
        }
    }

    componentWillUnmount() {
        setSessionStorage("navigatorComponentState", {
            "activeList":    this.state.activeList,
            "dataNavView":   this.state.dataNavView,
            "macroscopeView": this.state.macroscopeView,
            "dropdownLists": this.state.dropdownLists,
            "navigators":    this.state.navigators,
            "path":          this.state.path,
        });
    }

    // determine if we need to set up to show a keyword
    componentDidMount() {
        // get previous view data from session storage, default to stories
        const {data} = getSessionStorage("SelectedNavOntology") || {"data": "Stories"};
        // no keyword loaded
        if (this.props.searchState.inputValue === "") {
            // populate center list (always — Redux displayList resets on page reload)
            // skip if Macroscope tab is active (it has no center list)
            if (!this.state.macroscopeView) {
                this.handleLevelTwoClick(data);
                if (this.TINav.includes(data)) {
                    // get previous dropdown info
                    const prevDropdowns = getSessionStorage("dropdownLists");
                    // only if something to load
                    if (prevDropdowns) {
                        if (prevDropdowns.length === 1) {
                            // genre or ETK to load
                            this.selectMenu(prevDropdowns[0], false);
                        } else if (prevDropdowns.length === 2) {
                            // tango double-dropdown to load
                            this.selectMenu(prevDropdowns[0], true);
                            if (prevDropdowns[1]) {
                                this.selectMenu(prevDropdowns[1], false);
                            }
                        }
                    }
                }
            }
        } else {
            // keyword loaded, we'll be looking at the stories
            this.props.setDisplayLabel("Data Navigator > Stories");
            this.setState({
                // highlight stories
                "activeList": "Stories",
                // no dropdowns to show
                "dropdownLists": [],
                // set the path
                "path": ["Data Navigator", "Stories"],
            });
        }
    }

    /**
     * Make a certain tab the active tab
     * @param {String} name Tab to make active
     */
    setActiveTab(name) {
        // reset search
        this.props.actions.setSearch(false);
        // resets displayed results
        this.props.actions.displayItems([]);
        // if data navigator was clicked
        if (name === "Data Navigator") {
            this.props.setDisplayLabel("Data Navigator");
            this.setState({
                "dataNavView": true,
                "macroscopeView": false,
                "dropdownLists": [],
                "navigators": [
                    {"name": "Data Navigator", "tabClass": "tab cell medium-4 dataNavView active"},
                    {"name": "Topic & Index Navigator", "tabClass": "tab cell medium-4 TINavView"},
                    {"name": "Macroscope", "tabClass": "tab cell medium-4 macroscopeView"},
                ],
                "path": ["Data Navigator"],
            });
        } else if (name === "Topic & Index Navigator") {
            this.props.setDisplayLabel("Topic & Index Navigator");
            this.setState({
                "dataNavView": false,
                "macroscopeView": false,
                "dropdownLists": [],
                "navigators": [
                    {"name": "Data Navigator", "tabClass": "tab cell medium-4 dataNavView"},
                    {"name": "Topic & Index Navigator", "tabClass": "tab cell medium-4 TINavView active"},
                    {"name": "Macroscope", "tabClass": "tab cell medium-4 macroscopeView"},
                ],
                "path": ["Topic & Index Navigator"],
            });
        } else if (name === "Macroscope") {
            this.props.setDisplayLabel("Macroscope");
            this.setState({
                "dataNavView": false,
                "macroscopeView": true,
                "dropdownLists": [],
                "navigators": [
                    {"name": "Data Navigator", "tabClass": "tab cell medium-4 dataNavView"},
                    {"name": "Topic & Index Navigator", "tabClass": "tab cell medium-4 TINavView"},
                    {"name": "Macroscope", "tabClass": "tab cell medium-4 macroscopeView active"},
                ],
                "path": ["Macroscope"],
            });
        } else {
            console.warn("Invalid tab name", name);
        }
    }

    /**
     * Switch to a selected ontology
     * @param {String} ontology Ontology to switch to
     */
    handleLevelTwoClick(ontology) {
        // reset search
        this.props.actions.setSearch(false);
        // save selected ontology to session storage so the selection will remain if the user switches tabs
        setSessionStorage("SelectedNavOntology", {
            "data": ontology,
        });
        // get items associated with the ontology
        let list = getList(ontology);
        // if it is person, place, story, or fieldtrip
        if (["Fieldtrips", "People", "Places", "Stories"].includes(ontology)) {
            // display the relevant items
            this.props.actions.displayItems(list);
            // highlight clicked ontology, set dropdownLists to nothing, update path
            this.setStateAndPathLabel(({path}) => ({
                "activeList": ontology,
                "dropdownLists": [],
                "path": [path[0], ontology],
            }));
        } else if (["ETK Index", "Tangherlini Index", "Genres"].includes(ontology)) {
            // was one of the other ones that isn't a single category of data
            // reset results display
            this.props.actions.displayItems([]);
            // create additional options for people to be in the dropdown menu so people can select everything in the menu
            const displayKey = ontologyToDisplayKey[ontology];
            let
                // object to represent the dropdown
                listObject = {
                    displayKey,
                    ontology,
                },
                // initial dropdown value
                selectValue;
            // for ETK indices
            if (ontology === "ETK Index") {
                // use the ontology itself as the name
                selectValue = "[Select ETK Index]";
            } else {
                // other type, format it to work out
                selectValue = `[Select ${ontology.slice(0, -1)}]`;
            }
            // update the dropdown with the initial vluae
            listObject = {
                ...listObject,
                selectValue,
            };
            // if we are going to the tango indices
            if (ontology === "Tangherlini Index") {
                listObject = {
                    ...listObject,
                    // set the options to be the tango types, but add in the Select option
                    "list": [
                        "[Select a Class]",
                        ...Object.keys(tangoTypes),
                    ],
                    // this is a tango list
                    "tango": true,
                };
            } else if (ontology === "ETK Index" || ontology === "Genres") {
                // either ETK index or gernes
                // if the [Select a ___] isn't in the dropdown list
                if (list.some((item) => item[displayKey] === selectValue) === false) {
                    // add it in at the front
                    list = [
                        {
                            [displayKey]: selectValue,
                        },
                        ...list,
                    ];
                }
                listObject = {
                    ...listObject,
                    // use our generated list for options
                    list,
                    // this is not a tango list
                    "tango": false,
                };
            } else {
                // bad ontology, abort
                console.warn("Bad ontology", ontology);
                return;
            }
            // update state and path label
            this.setStateAndPathLabel(({path}) => ({
                // highlight clicked ontology
                "activeList": ontology,
                // use our generated dropdown object
                "dropdownLists": [listObject],
                // update the path with the clicked one
                "path": [path[0], ontology],
            }));
        }
    }

    /**
     * Handle the selection of a dropdown item
     * @param {Object} selectedItem Selected dropdown element
     * @param {Boolean} isTango Whether or not the item is an upper-level Tango dropdown
     */
    selectMenu(selectedItem, isTango) {
        // reset search
        this.props.actions.setSearch(false);
        // for non upper level tango index dropdowns
        if (isTango === false) {
            // make sure that we didn't re-select the [Select a ___] option from the dropdown
            if (typeof selectedItem.id !== "undefined") {
                const prevDropdowns = getSessionStorage("dropdownLists");
                // if its a tango submenu
                if (prevDropdowns && prevDropdowns.length === 2) {
                    setSessionStorage("dropdownLists", [prevDropdowns[0], selectedItem]);
                } else {
                    // genre/etk dropdown
                    setSessionStorage("dropdownLists", [selectedItem]);
                }
                // update the displayed items
                this.props.actions.displayItems(
                    // use the list of stories based on the chosen option
                    arrayTransformation(selectedItem.stories.story)
                );
                // get the display name based on the chosen option
                let name;
                if (selectedItem.hasOwnProperty("name")) {
                    name = selectedItem.name;
                } else if (selectedItem.hasOwnProperty("heading_english")) {
                    name = selectedItem.heading_english;
                }
                // update state and path
                this.setStateAndPathLabel((oldState) => {
                    // get previous dropdowns and path
                    let {dropdownLists, path} = oldState;
                    // update the selected item
                    dropdownLists[dropdownLists.length - 1].selectValue = name;
                    // trim the path if necessary
                    if (path.length >= 3 && path.includes("Tangherlini Index") === false) {
                        path = path.slice(0, 2);
                    } else if (path.length >= 4) {
                        path = path.slice(0, 3);
                    }
                    // append the selected item to the path
                    path = [...path, name];
                    return {
                        dropdownLists,
                        path,
                    };
                });
            } else {
                // clear all items
                this.props.actions.displayItems([]);
                // update dropdowns and path
                this.setStateAndPathLabel(({dropdownLists, path}) => ({
                    // set the dropdown to be
                    "dropdownLists": [
                        {
                            // the first dropdown
                            ...dropdownLists[0],
                            // but make sure that the selected value is the [Select a ___] option
                            "selectValue": selectedItem.heading_english,
                        },
                    ],
                    // remove the last element from path, since it got deselected
                    "path": path.slice(0, -1),
                }));
            }
        } else {
            // top level tango index option picked
            // special format for dropdown recognition
            setSessionStorage("dropdownLists", [selectedItem, null]);
            // set base path accordingly
            const path = ["Topic & Index Navigator", "Tangherlini Index"];
            if (selectedItem !== "[Select a Class]") {
                // not the null option
                // clear the displayed items
                this.props.actions.displayItems([]);
                this.setStateAndPathLabel(({dropdownLists}) => ({
                    "dropdownLists": [
                        {
                            ...dropdownLists[0],
                            // set clicked item in the upper dropdown to the one that was just clicked
                            "selectValue": selectedItem,
                        },
                        // need to make second dropdown list with the sub tango options
                        {
                            // start with the select something option
                            "selectValue": "[Select an Ontology]",
                            // key for names is "name"
                            "displayKey": "name",
                            "ontology": "",
                            // not an upper level tango dropdown
                            "tango": false,
                            "list": [
                                // add the select something option on top
                                {"name": "[Select an Ontology]"},
                                // add the actual options below it
                                ...tangoTypes[selectedItem].children,
                            ],
                        },
                    ],
                    // add the item we went to at the end of the path
                    "path": [...path, selectedItem],
                }));
            } else {
                // reset the dropdown state to the unselected tango index state, since that's what was clikced
                this.setStateAndPathLabel(({dropdownLists}) => ({
                    // set the dropdown to be
                    "dropdownLists": [{
                        // the first dropdown
                        ...dropdownLists[0],
                        // but make sure that the selected value is the [Select a Class] option
                        "selectValue": "[Select a Class]",
                    }],
                    // go back to the base tango path
                    path,
                }));
            }
        }
    }

    /**
     * Set state and update the displayed path label
     * @param {(Function|Object)} callback Determines state to be set
     */
    setStateAndPathLabel(callback) {
        // apply the requested state changes
        this.setState(callback, () => {
            // update the path displayed afterwards
            this.props.setDisplayLabel(this.state.path.join(" > "));
        });
    }

    render() {
        const ontologyType = this.state.dataNavView === true ? "dataNav" : "TINav";
        return (
            <div className="NavigatorComponent grid-y">
                <div className="navigator-tabs cell medium-1 grid-x" role="tablist">{
                    this.state.navigators.map(({name, tabClass}) => (
                        <div
                            className={tabClass}
                            key={name}
                            role="tab"
                            tabIndex={0}
                            aria-selected={tabClass.includes("active")}
                            onClick={this.setActiveTab.bind(this, name)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    this.setActiveTab(name);
                                }
                            }}>
                            {name}
                        </div>
                    ))
                }</div>
                <div className="navigator-options-wrapper cell medium-11">
                    {this.state.macroscopeView ? (
                        <ul className="macroscopeList">
                            {this.macroscopeNav.map((tool) => (
                                <li
                                    className="macroscopeTool"
                                    key={tool.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => this.props.addTab(tool.id, tool.name, "Macroscope")}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter" || event.key === " ") {
                                            event.preventDefault();
                                            this.props.addTab(tool.id, tool.name, "Macroscope");
                                        }
                                    }}>
                                    <span className="macroscope-tool-name">{tool.name}</span>
                                    <br />
                                    <span className="macroscope-tool-desc">{tool.desc}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className={`cell active ${ontologyType}View`}>
                            <ul className="ontologyList">{
                                this[ontologyType].map((ontology) => (
                                    <li
                                        className={`ontology ${ontology} ${this.state.activeList === ontology ? "active" : ""}`}
                                        key={ontology}
                                        role="button"
                                        tabIndex={0}
                                        aria-pressed={this.state.activeList === ontology}
                                        onClick={this.handleLevelTwoClick.bind(this, ontology)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter" || event.key === " ") {
                                                event.preventDefault();
                                                this.handleLevelTwoClick(ontology);
                                            }
                                        }}>
                                        {ontology}
                                    </li>
                                ))
                            }</ul>
                            {this.state.dropdownLists.map((list, i) => (
                                <NavigationDropdownMenu
                                    className="cell"
                                    list={list}
                                    handleMenuSelect={this.selectMenu.bind(this)}
                                    key={i} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

/**
 * Set certain props to access Redux states
 * @param {Object} state All possible Redux states
 * @returns {Object} Certain states that are set on props
 */
function mapStateToProps(state) {
    return {
        "searchState": state.search,
        "state": state.tabViewer,
    };
}

/**
 * Set the "actions" prop to access Redux actions
 * @param {*} dispatch Redux actions
 * @returns {Object} The actions that are mapped to props.actions
 */
function mapDispatchToProps(dispatch) {
    return {
        "actions": {
            ...bindActionCreators(searchActions, dispatch),
            ...bindActionCreators(navigatorActions, dispatch),
        },
    };
}

Navigation.propTypes = {
    "actions": PropTypes.object.isRequired,
    "addTab": PropTypes.func.isRequired,
    "searchState": PropTypes.shape({
        "inputValue": PropTypes.string.isRequired,
        "results": PropTypes.array.isRequired,
    }).isRequired,
    "setDisplayLabel": PropTypes.func.isRequired,
    "state": PropTypes.object.isRequired,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Navigation);
