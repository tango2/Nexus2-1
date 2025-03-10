// react functionality
import React, {Component} from "react";
// prop validation
import PropTypes from "prop-types";
// styling for the view
import "./BookView.css";
// book viewer
import ePub from "epubjs";
// redux functionality
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
// actions to manipulate the tabs
import * as tabViewerActions from "../../actions/tabViewerActions";
// data for the dropdown
import menuList from "../../data/book_menu.json";

class BookView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // start with the chapter list hidden
            "dropdownActive": false,
            "fontSize": 16,
            // not searching at start
            "searchActive": false,
            "searchJSX": null,
            "searchValue": "",
            // update with any previous state stored in redux
            ...props.state.views[props.viewIndex].state,
        };
        this.dropdownJSX = menuList.map((item) => (
            // each is a button
            <button
                // style it as a TOC element
                className="toc-item"
                // unique key for React
                key={item.id}
                // handler for when it is clicked
                onClick={() => {
                    // go to the chapter that was clciked
                    this.rendition.display(item.location);
                    // hide the dropdown
                    this.setState({
                        "dropdownActive": false,
                    });
                }}>
                {/* display the whitespace stripped version of the chapter title */}
                {item.name.trim()}
            </button>
        ));
        // to be set once the book is rendered
        this.book = null;
        this.rendition = null;
        // ref to the book div so we can render the content there
        this.bookRef = React.createRef();
        // bind the event handler so it works properly inside the listener
        this.handleKeyPress = this.handleKeyPress.bind(this);
        // measured in px
        this.minimumFontSize = 10;
        this.maximumFontSize = 36;
    }

    // called after the DOM loads for the first time
    componentDidMount() {
        // add an event listener for left and right arrow controls
        document.addEventListener("keydown", this.handleKeyPress, false);
        // load the .epub book
        this.book = ePub(`${process.env.PUBLIC_URL}/Book/merge_from_ofoct.epub`);
        // when it has successfully loaded
        this.book.loaded.navigation.then(() => {
            // node to render the book to
            const node = this.bookRef.current;
            // render the book to the "book" div
            this.rendition = this.book.renderTo(node, {
                // make it occupy all that space
                "height": "100%",
                "width": "100%",
            });
            // variable to store the final location
            let location;
            // numerical ID means it's a chapter number
            if (typeof this.props.id === "number") {
                // get the corresponding spot in the book for the chapter
                ({location} = menuList[this.props.id]);
            } else if (typeof this.props.id === "string") {
                // id is a string location in the book, use that
                location = this.props.id;
            } else {
                // bad type, warn that
                console.warn(`Invalid id: ${this.props.id}`);
            }
            this.rendition.themes.fontSize(`${this.state.fontSize}px`);
            // display the book
            this.rendition.display(location);
            // update the tab's ID whenever the page is changed (so it can be re-loaded later)
            this.rendition.on("locationChanged", (newPage) => {
                this.props.tabViewerActions.updateTab(this.props.viewIndex, {
                    "id": newPage.start,
                });
            });
        });
    }

    // called as the book is being switched away from/closed
    componentWillUnmount() {
        // "delete" the book and rendition
        this.book = null;
        this.rendition = null;
        // remove our event listener
        document.removeEventListener("keydown", this.handleKeyPress, false);
        // save state to redux for later
        const thisView = this.props.state.views[this.props.viewIndex];
        if (thisView && thisView.id === this.props.id && thisView.type === "Book") {
            // console.log(this)
            this.props.tabViewerActions.updateTab(this.props.viewIndex, {
                "state": this.state,
            });
        }
    }

    // handler for key presses
    handleKeyPress({key}) {
        switch (key) {
            // when the right arrow is clicked
            case "ArrowRight":
                // go to the next page
                this.rendition.next();
                break;
            // when the left arrow is clicked
            case "ArrowLeft":
                // go to the previous page
                this.rendition.prev();
                break;
            // nothing to do if it was another key
            default:
                break;
        }
    }

    /**
     * Handle a search in the book
     * @param {String} query The string to search for
     */
    async handleSearch(query) {
        // short queries cause it to stall, don't allow that
        if (query.length >= 2) {
            const results = await Promise.all(
                // black magic to search the book: https://github.com/futurepress/epub.js/wiki/Tips-and-Tricks-%28v0.3%29#searching-the-entire-book
                this.book.spine.spineItems
                    .map((item) => item.load(this.book.load.bind(this.book))
                        .then(item.find.bind(item, query))
                        .finally(item.unload.bind(item)))
            ).then((queries) => Promise.resolve(
                // flatten the array into a 1-D array
                [].concat(...queries)
            ));
            this.setState({
                // show the results
                "searchActive": true,
                // convert the results into JSX
                "searchJSX": results.map((entry, i) => (
                    // each is a button
                    <button
                        // unique key for react
                        key={i}
                        // style it like a search result
                        className="searchResult"
                        // when clicked
                        onClick={() => {
                            // go to the page this points to
                            this.rendition.display(entry.cfi);
                            // turn off the search since we want to see the box
                            this.setState({
                                "searchActive": false,
                            });
                        }}>
                        {/* show the excerpt that matches the search */}
                        {entry.excerpt}
                    </button>
                )),
            });
        }
    }

    /**
     * Change the font size of the book
     * @param {number} change How much to change the font size by
     */
    changeFontSize(change) {
        this.setState(({fontSize}) => {
            let newSize = fontSize + change;
            if (newSize < this.minimumFontSize) {
                newSize = this.minimumFontSize;
            }
            if (newSize > this.maximumFontSize) {
                newSize = this.maximumFontSize;
            }
            return {
                "fontSize": newSize,
            };
        }, () => {
            this.rendition.themes.fontSize(`${this.state.fontSize}px`);
        });
    }

    render() {
        return (
            // div to contain book + button
            <div className="BookView grid-y">
                {/* if TOC was requested */}
                {this.state.dropdownActive === true &&
                    <div className="toc"
                        // should anywhere be clicked, disable the dropdown
                        onClick={() => {
                            this.setState({
                                "dropdownActive": false,
                            });
                        }}>
                        {/* render the dropdown */}
                        <div className="solid">{this.dropdownJSX}</div>
                    </div>}
                {/* header */}
                <div className="cell medium-1 grid-x">
                    {/* TOC opener */}
                    <button
                        // style it as a 2-column button
                        className="button secondary cell medium-2"
                        // when it is clicked
                        onClick={(event) => {
                            // don't allow left page button to be clicked (no doubly processed click)
                            event.stopPropagation();
                            // show the dropdown
                            this.setState({
                                "dropdownActive": true,
                            });
                        }}>Table of Contents</button>
                    {/* search form */}
                    <form
                        // it should fill up the remainder of the header
                        className="cell medium-10 grid-x"
                        // if either submit button clicked or enter received
                        onSubmit={(event) => {
                            // prevent default redirect
                            event.preventDefault();
                            // handle the requested search
                            this.handleSearch(this.state.searchValue);
                        }}>
                        {/* search input field */}
                        <input
                            // text input
                            type="text"
                            // 2/3 of the form's width
                            className="cell medium-8"
                            // placeholder to show if nothing typed
                            placeholder="Search the book..."
                            // value based on what has been typed
                            value={this.state.searchValue}
                            // when a typing occurs
                            onChange={(event) => {
                                // update the search value in state
                                this.setState({
                                    "searchValue": event.target.value,
                                });
                            }} />
                        {/* search button */}
                        <input
                            // trigger submit when clicked
                            type="submit"
                            // 1/3 of form, make it look button-y
                            className="button primary cell medium-4"
                            // text to display on the button
                            value="Search" />
                    </form>
                </div>
                {/* hide the book but keep the elements in the DOM if a search is going */}
                {/* this is so that the book still has its div to render to and doesn't break during a search */}
                <div
                    className={`book-controls cell medium-11 grid-x ${this.state.searchActive && "hidden"}`}>
                    <div className="cell medium-1 grid-y">
                        <div className="cell medium-1 grid-x">
                            <button
                                className="cell fontButton"
                                onClick={this.changeFontSize.bind(this, -1)}>
                                a
                            </button>
                            <button
                                onClick={this.changeFontSize.bind(this, 1)}
                                className="cell fontButton">
                                A
                            </button>
                        </div>
                        {/* button to go back a page */}
                        <button
                            // give it page turn styling
                            className="cell medium-10 pager"
                            onClick={() => {
                                // go to the left page on click
                                this.rendition.prev();
                            }}>
                            {/* show a large < */}
                            <img
                                className="left-hover"
                                src="https://img.icons8.com/ios/50/000000/chevron-left-filled.png" alt="<" />
                        </button>
                        <div className="cell medium-1"></div>
                    </div>
                    {/* actual book content */}
                    <div className="book cell medium-10" ref={this.bookRef} />
                    {/* button to go forward a page */}
                    <button
                        // give it page turn styling
                        className="pager cell medium-1"
                        onClick={() => {
                            // go to the right page on click
                            this.rendition.next();
                        }}>
                        {/* show a large > */}
                        <img
                            src="https://img.icons8.com/ios/50/000000/chevron-right-filled.png"
                            alt=">" />
                    </button>
                </div>
                {/* when the search results are to be shown */}
                {this.state.searchActive === true &&
                    <div className="cell medium-11 results">
                        {/* show the rendered results */}
                        {this.state.searchJSX}
                    </div>}
            </div>
        );
    }
}

BookView.propTypes = {
    "id": PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    "state": PropTypes.shape({
        "views": PropTypes.arrayOf(
            PropTypes.shape({
                "active": PropTypes.bool,
                "color": PropTypes.string,
                "id": PropTypes.oneOfType([
                    PropTypes.number,
                    PropTypes.string,
                ]),
                "name": PropTypes.string,
                "type": PropTypes.string,
            })
        ).isRequired,
    }).isRequired,
    "tabViewerActions": PropTypes.shape({
        "addTab": PropTypes.func,
        "closeTab": PropTypes.func,
        "moveTab": PropTypes.func,
        "switchTaxbs": PropTypes.func,
        "updateTab": PropTypes.func.isRequired,
    }).isRequired,
    "viewIndex": PropTypes.number.isRequired,
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
)(BookView);
