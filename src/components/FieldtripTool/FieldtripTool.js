import "./FieldtripTool.css";
import React from "react";
import MapView from "../MapView/MapView";
import {getFieldtripsByID, getPlacesByID} from "../../data-stores/DisplayArtifactModel";
// import data for fieldtrips
import FieldtripsData from "../../data/cfieldtrips.json";
// import the fieldtrip route/stops geojsons, keyed by fieldtrip_id
import geojsons from "../../data/ft_geojsons/combined_geojson.js";
import {bindActionCreators} from "redux";
import * as tabViewerActions from "../../actions/tabViewerActions";
import connect from "react-redux/es/connect/connect";

class FieldtripTool extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "activeFieldtrips": props.fieldtrip ? [props.fieldtrip] : [],
            // update with any previous state stored in redux
            ...props.state.views[props.viewIndex].state,
        };
    }

    componentWillUnmount() {
        // save state to redux for later
        this.props.actions.updateTab(this.props.viewIndex, {
            "state": this.state,
        });
    }

    handleSelect(fieldtrip_id) {
        if (fieldtrip_id === -1) {
            this.setState({
                "activeFieldtrips": FieldtripsData.fieldtrip
                    .map((fieldtrip) => fieldtrip.fieldtrip_id)
                    .filter((id) => id !== -1),
            });
        } else {
            this.setState(({activeFieldtrips}) => {
                const index = activeFieldtrips.indexOf(fieldtrip_id);
                if (index === -1) {
                    return {
                        "activeFieldtrips": [...activeFieldtrips, fieldtrip_id],
                    };
                } else if (index >= 0) {
                    activeFieldtrips.splice(index, 1);
                    return {
                        activeFieldtrips,
                    };
                } else {
                    console.warn("FieldtripTool's activeFieldtrips is corrupt", activeFieldtrips);
                    return {
                        activeFieldtrips,
                    };
                }
            });
        }
    }

    render() {
        const {activeFieldtrips} = this.state;
        console.log(activeFieldtrips);
        // get places to show as a 1-D array
        const PlacesVisited = [].concat(
            // use the fieldtrips to show
            ...activeFieldtrips.map((fieldtrip) =>
                // and extract the places from those fieldtrips
                getFieldtripsByID(fieldtrip).places_visited.map((place) => getPlacesByID(place.place_id)))
        );
        // route + stops geojsons for every active fieldtrip, same as FieldtripView
        const ActiveGeojsons = [].concat(
            ...activeFieldtrips
                .filter((fieldtrip) => geojsons[fieldtrip])
                .map((fieldtrip) => [geojsons[fieldtrip].route, geojsons[fieldtrip].stops])
        );
        return (
            <div className="FieldtripTool grid-x">
                <div className="cell medium-3">
                    <h3>Fieldtrip Viewer</h3>
                    <ul>
                        {FieldtripsData.fieldtrip.map(({fieldtrip_id, fieldtrip_name}) => (
                            <li
                                key={fieldtrip_id}
                                className={`cell ${activeFieldtrips.includes(fieldtrip_id) ? "activeTrip" : ""}`}
                                role="button"
                                tabIndex={0}
                                aria-pressed={activeFieldtrips.includes(fieldtrip_id)}
                                onClick={this.handleSelect.bind(this, fieldtrip_id)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        this.handleSelect(fieldtrip_id);
                                    }
                                }}>
                                {fieldtrip_name}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="cell medium-9">
                    <MapView places={PlacesVisited} view="Fieldtrip" geojsons={ActiveGeojsons} />
                </div>
            </div >
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
        "actions": bindActionCreators(tabViewerActions, dispatch),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(FieldtripTool);
