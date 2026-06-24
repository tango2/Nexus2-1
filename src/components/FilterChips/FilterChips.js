import React, { Component } from "react";
import "./FilterChips.css";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import connect from "react-redux/es/connect/connect";
import * as navigatorActions from "../../actions/navigatorActions";
import { getStoryGenres, getCollectionPrefix } from "../../data-stores/DisplayArtifactModel";

const COLLECTION_LABELS = {
    "Unpub": "Unpublished",
};

function collectionLabel(prefix) {
    return COLLECTION_LABELS[prefix] || prefix;
}

class FilterChips extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeGenres: new Set(),
            activeCollections: new Set(),
        };
    }

    componentDidUpdate(prevProps) {
        // New search — reset all chips and show full results
        if (prevProps.searchQuery !== this.props.searchQuery) {
            this.setState({ activeGenres: new Set(), activeCollections: new Set() });
        }
    }

    // Compute which genres and collections are present in the current result set, with counts
    computeChipData() {
        const genres = {};
        const collections = {};
        this.props.results.forEach(story => {
            const prefix = getCollectionPrefix(story.publication_info);
            if (prefix) collections[prefix] = (collections[prefix] || 0) + 1;
            getStoryGenres(story.story_id).forEach(g => {
                genres[g] = (genres[g] || 0) + 1;
            });
        });
        return { genres, collections };
    }

    // Apply active filters to the base results and return the filtered array
    filtered(activeGenres, activeCollections) {
        return this.props.results.filter(story => {
            if (activeGenres.size > 0) {
                const sg = getStoryGenres(story.story_id);
                if (!sg.some(g => activeGenres.has(g))) return false;
            }
            if (activeCollections.size > 0) {
                if (!activeCollections.has(getCollectionPrefix(story.publication_info))) return false;
            }
            return true;
        });
    }

    toggleGenre(genre) {
        const ag = new Set(this.state.activeGenres);
        ag.has(genre) ? ag.delete(genre) : ag.add(genre);
        this.setState({ activeGenres: ag }, () => {
            this.props.actions.filterDisplayItems(this.filtered(ag, this.state.activeCollections));
        });
    }

    toggleCollection(col) {
        const ac = new Set(this.state.activeCollections);
        ac.has(col) ? ac.delete(col) : ac.add(col);
        this.setState({ activeCollections: ac }, () => {
            this.props.actions.filterDisplayItems(this.filtered(this.state.activeGenres, ac));
        });
    }

    clearAll() {
        this.setState({ activeGenres: new Set(), activeCollections: new Set() }, () => {
            this.props.actions.filterDisplayItems(this.props.results);
        });
    }

    render() {
        const { searchMode, results } = this.props;
        if (!searchMode || !results.length) return null;

        const { genres, collections } = this.computeChipData();
        const { activeGenres, activeCollections } = this.state;
        const anyActive = activeGenres.size > 0 || activeCollections.size > 0;
        const filteredCount = anyActive
            ? this.filtered(activeGenres, activeCollections).length
            : results.length;

        const genreEntries = Object.entries(genres).sort((a, b) => b[1] - a[1]);
        const collectionEntries = Object.entries(collections)
            .sort((a, b) => b[1] - a[1])
            .filter(() => Object.keys(collections).length > 1);

        return (
            <div className="filter-chips-container">
                <div className="filter-chips-summary">
                    <span>{filteredCount} of {results.length} results</span>
                    {anyActive && (
                        <button className="filter-chips-clear" onClick={() => this.clearAll()}>
                            clear filters
                        </button>
                    )}
                </div>

                {genreEntries.length > 0 && (
                    <div className="filter-chips-row">
                        <span className="filter-chips-label">Genre</span>
                        {genreEntries.map(([name, count]) => (
                            <button
                                key={name}
                                className={"filter-chip" + (activeGenres.has(name) ? " active" : "")}
                                onClick={() => this.toggleGenre(name)}>
                                {name} <span className="chip-count">{count}</span>
                            </button>
                        ))}
                    </div>
                )}

                {collectionEntries.length > 0 && (
                    <div className="filter-chips-row">
                        <span className="filter-chips-label">Collection</span>
                        {collectionEntries.map(([prefix, count]) => (
                            <button
                                key={prefix}
                                className={"filter-chip" + (activeCollections.has(prefix) ? " active" : "")}
                                onClick={() => this.toggleCollection(prefix)}>
                                {collectionLabel(prefix)} <span className="chip-count">{count}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }
}

FilterChips.propTypes = {
    "actions": PropTypes.object.isRequired,
    "results": PropTypes.array.isRequired,
    "searchMode": PropTypes.bool.isRequired,
    "searchQuery": PropTypes.string.isRequired,
};

function mapStateToProps(state) {
    return {
        "results": state.search.results,
        "searchMode": state.navigator.searchMode,
        "searchQuery": state.search.inputValue,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        "actions": bindActionCreators(navigatorActions, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FilterChips);
