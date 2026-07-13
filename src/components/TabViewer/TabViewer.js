// react functionality
import React, {Component} from "react";
// the various possible views we could render
import HelpView from "../HelpView/HelpView";
import Navigation from "../Navigation/Navigation";
import StoryView from "../StoryView/StoryView";
import PlaceView from "../PlaceView/PlaceView";
import PeopleView from "../PeopleView/PeopleView";
import FieldtripView from "../FieldtripView/FieldtripView";
import BookView from "../BookView/BookView";
import GraphView from "../NexusGraph/GraphView";
import FieldtripTool from "../FieldtripTool/FieldtripTool";
import MacroscopeView from "../MacroscopeView/MacroscopeView";
// functions to get info about PPFS
import * as model from "../../data-stores/DisplayArtifactModel";
// CSS styling
import "./TabViewer.css";
// prop validation
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
// actions to manipulate the tabs
import * as tabViewerActions from "../../actions/tabViewerActions";

class TabViewer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // starting off without a drag
            "dragIndicatorX": null,
        };
        // to be set once a render is complete
        this.dragIndicatorY = null;
        this.dragIndicatorHeight = null;
        // used for drag events
        this.desiredIndex = null;
        this.originalIndex = null;
        // stores the left edge X-coordiantes of each tab
        this.tabs = [];
        // ref to the scrollable tab list
        this.tabListRef = React.createRef();
        // properly bind functions so that they can work in sub-elements
        this.renderActiveTab = this.renderActiveTab.bind(this);
    }

    componentDidUpdate(prevProps) {
        // when the active tab changes, scroll it into view
        const prevActive = prevProps.state.views.findIndex(v => v.active);
        const nextActive = this.props.state.views.findIndex(v => v.active);
        if (prevActive !== nextActive && this.tabListRef.current) {
            const activeTab = this.tabListRef.current.children[nextActive];
            if (activeTab) {
                activeTab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
            }
        }
    }

    scrollTabBar(direction) {
        if (this.tabListRef.current) {
            this.tabListRef.current.scrollBy({ left: direction * 200, behavior: "smooth" });
        }
    }

    /**
     * Render the main content of the app
     * @param {*} id ID of the relevant person/place/story/fieldtrip/book to load (irrelevant for NexusGraph, Home)
     * @param {String} type The type of view to load (People/Places/Fieldtrips/Stories/Home/Graph/Book)
     * @param {Number} tabIndex Index of the tab being rendered (only necessary for BookView)
     * @returns {JSX} The content of the relevant view
     */
    renderPPFS(id, type, tabIndex) {
        // depending on the type of the view to render
        // key is necessary so a re-render is forced whenever tabs are switched (resets state/switches book page properly)
        switch (type) {
            case "People":
                // for people, return a PeopleView with the person retrieved by the passed ID
                return <PeopleView key={tabIndex} person={model.getPeopleByID(id)} />;
            case "Places":
                // for places, return a PlaceView with the place retrieved by the passed ID
                return <PlaceView key={tabIndex} place={model.getPlacesByID(id)} />;
            case "Fieldtrips":
                // for fieldtrip, return a FieldtripView with the fieldtrip retrieved by the passed ID
                return <FieldtripView key={tabIndex} fieldtrip={model.getFieldtripsByID(id)} />;
            case "Stories":
                // for stories, return a StoryView with the story retrieved by the passed ID
                return <StoryView key={tabIndex} story={model.getStoryByID(id)} viewIndex={tabIndex}/>;
            case "Home":
                // for the Home tab, return the main Navigation view (home)
                return <Navigation key={tabIndex} />;
            case "Graph":
                // for the graph, return the GraphView
                return <GraphView key={tabIndex} viewIndex={tabIndex} />;
            case "Book":
                // for the book, return the BookView, with the chapter ID that was selected
                return <BookView key={tabIndex} viewIndex={tabIndex} id={id} />;
            case "Help":
                return <HelpView key={tabIndex} viewIndex={tabIndex} />;
            case "FieldtripTool":
                return <FieldtripTool key={tabIndex} fieldtrip={id} viewIndex={tabIndex} />;
            case "Macroscope":
                return <MacroscopeView key={tabIndex} id={id} />;
            default:
                // if it wasn't one of the above types, warn that we hit an unknown type
                console.warn(`Unhandled tab type: ${type}`);
        }
    }

    /**
     * Render the active tab as the main content of the page
     * @returns {JSX} The rendered JSX
     */
    renderActiveTab() {
        // search through the list of tabs for the active tab
        const activeViewIndex = this.props.state.views.findIndex((view) => view.active);
        const activeView = this.props.state.views[activeViewIndex];
        // return the rendered content of the tab
        return this.renderPPFS(activeView.id, activeView.type, activeViewIndex);
    }

    // called when a tab begins being dragged
    handleDragStart(event, index) {
        // set the tab to be gray
        event.target.style.backgroundColor = "#aaaaaa";
        // set appropriate data for the drag
        this.originalIndex = index;
        // so that Firefox actually lets us drag stuff
        event.dataTransfer.setData("text/plain", this.props.state.views[index].name);
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.dropEffect = "move";
    }

    // called when a drag goes over a new tab
    handleDragEnter(event, newIndex) {
        // update where the tab would be placed if released
        this.desiredIndex = newIndex;
        this.setState({
            // if drag is to the right, draw the drag indicator on the right of the tab where it would be dropped
            // if it was to the left, draw the indicator on the left of the tab where it would be dropped
            // if we are at the same index don't draw anything
            "dragIndicatorX": newIndex > this.originalIndex ? this.tabs[newIndex].right
                : newIndex < this.originalIndex ? this.tabs[newIndex].left : null,
        });
    }

    // called when a tab stops being dragged (is released)
    handleDragEnd(event) {
        // move the dragged tab to the desired spot
        this.props.tabViewerActions.moveTab(this.originalIndex, this.desiredIndex);
        // reset indices of drag
        this.originalIndex = null;
        this.desiredIndex = null;
        // reset the tab's color
        event.target.style.backgroundColor = null;
        // hide the drag indicator
        this.setState({
            "dragIndicatorX": null,
        });
    }

    render() {
        return (
            <div className="TabViewer grid-container full">
                <div className="grid-y">
                    {/* Wrapper/container for the View, not including the tabs*/}
                    <div className="view cell fill"> {/* Class "fill" fills out the rest of the application space with the view*/}
                        {/* Function below generates/sorts out which view should be displayed*/}
                        {this.renderActiveTab()}
                    </div>
                    {/* Tab bar: fixed Home tab + scrollable content tabs */}
                    <div className="tab-bar-wrapper cell medium-1">
                        {/* Home tab — always visible, never scrolls away */}
                        <div
                            className={`home-tab ${this.props.state.views[0].active ? "active" : ""}`}
                            role="button"
                            tabIndex={0}
                            aria-label="Home tab"
                            aria-current={this.props.state.views[0].active}
                            onClick={() => this.props.tabViewerActions.switchTabs(0)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    this.props.tabViewerActions.switchTabs(0);
                                }
                            }}>
                            ⌂
                        </div>
                        <button className="tab-scroll-btn" aria-label="Scroll tabs left" onClick={() => this.scrollTabBar(-1)}>&#8249;</button>
                        {/* Scrollable list of content tabs (everything except Home) */}
                        <ul className="tabs" role="tablist" ref={this.tabListRef}>
                            {this.props.state.views.slice(1).filter(view => !!view.name).map((view, sliceIndex) => {
                                const index = sliceIndex + 1;
                                return (
                                    <li
                                        ref={(instance) => {
                                            if (instance !== null) {
                                                this.tabs[index] = instance.getBoundingClientRect();
                                                this.dragIndicatorY = instance.getBoundingClientRect().y;
                                                this.dragIndicatorHeight = instance.getBoundingClientRect().height;
                                            }
                                        }}
                                        role="tab"
                                        tabIndex={0}
                                        aria-selected={view.active}
                                        aria-label={`${view.name} tab`}
                                        onClick={() => this.props.tabViewerActions.switchTabs(index)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter" || event.key === " ") {
                                                event.preventDefault();
                                                this.props.tabViewerActions.switchTabs(index);
                                            }
                                        }}
                                        draggable
                                        onDragStart={(event) => this.handleDragStart(event, index)}
                                        onDragEnter={(event) => this.handleDragEnter(event, index)}
                                        onDragEnd={this.handleDragEnd.bind(this)}
                                        key={index}
                                        className={view.active ? "active" : ""}
                                        style={{"backgroundColor": view.color}}>
                                        <button
                                            className="pinTabIcon-btn"
                                            aria-label={view.pinned ? `Unpin ${view.name} tab` : `Pin ${view.name} tab`}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                this.props.tabViewerActions.pinTab(index);
                                            }}>
                                            <img
                                                src={view.pinned ? "https://img.icons8.com/ios/50/000000/pin-2-filled.png" : "https://img.icons8.com/ios/50/000000/pin-2.png"}
                                                alt=""
                                                className="pinTabIcon" />
                                        </button>
                                        <span className="tab-label">{view.name}</span>
                                        <button
                                            className="closeTabIcon-btn"
                                            aria-label={`Close ${view.name} tab`}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                this.props.tabViewerActions.closeTab(index);
                                            }}>
                                            <img
                                                src={require("../Navigation/icons8-delete-24.png")}
                                                alt=""
                                                className="closeTabIcon" />
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                        <button className="tab-scroll-btn" aria-label="Scroll tabs right" onClick={() => this.scrollTabBar(1)}>&#8250;</button>
                    </div>
                </div>
                {/* only display if we are currently dragging an element */}
                {this.state.dragIndicatorX !== null &&
                    // the drag indicator line
                    <div
                        // basic CSS for the moving line, position is defined dynamically here
                        id="dragIndicator"
                        // set up its position
                        style={{
                            // position it at the X-coordinate determined by drag functions
                            "left": this.state.dragIndicatorX,
                            // make it in line with tabs
                            "top": this.dragIndicatorY,
                            // make it as tall as the tabs
                            "height": this.dragIndicatorHeight,
                        }} />
                }
            </div>
        );
    }
}

TabViewer.propTypes = {
    "tabViewerActions": PropTypes.object.isRequired,
    "state": PropTypes.shape({
        "views": PropTypes.array.isRequired,
    }).isRequired,
};

/**
 * Set certain props to access Redux states
 * @param {Object} state All possible Redux states
 * @returns {Object} Certain states that are set on props
 */
function mapStateToProps(state) {
    return {
        "state": state.tabViewer,
    };
}

/**
 * Set the "tabViewerActions" prop to access Redux actions
 * @param {*} dispatch Redux actions
 * @returns {Object} The actions that are mapped to props.actions
 */
function mapDispatchToProps(dispatch) {
    return {
        "tabViewerActions": bindActionCreators(tabViewerActions, dispatch),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TabViewer);
