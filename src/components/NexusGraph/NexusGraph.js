// styling for the graph
import "./NexusGraph.css";
// basic react functionality
import React, {Component} from "react";
// graph functionality for the NexusGraph
import {Graph} from "react-d3-graph";
// prop validation
import PropTypes from "prop-types";
// function to get a node on the graph by its name
import {getNodeById} from "./NexusGraphModel";
import {bindActionCreators} from "redux";
import * as tabViewerActions from "../../actions/tabViewerActions";
import connect from "react-redux/es/connect/connect";

// basic settings for the graph, can be overriden with this.props
const settings = {
    // highlight nodes + links when hovered
    "nodeHighlightBehavior": true,
    // enable pan and zoom effects
    "panAndZoom": true,
    // add direction to links
    "directed": true,
    // settings for the nodes
    "node": {
        // this color only applies to the initial "blank" node, other nodes get custom colors by their type
        "color": "lightgreen",
        // size of the node
        "size": 120,
        // outline color of the node when it is highlighted (either on hover or via a hovered-on primary connected node)
        "highlightStrokeColor": "blue",
    },
    // settings for the links
    "link": {
        // link color when one of its endpoints is highlighted
        "highlightColor": "blue",
        // display label for each link
        "labelProperty": "label",
        "renderLabel": true,
        "fontSize": 12,
    },
};

class NexusGraph extends Component {
    constructor(props) {
        super(props);
        // no clicks handled yet
        this.lastNodeClicked = null;
        this.lastNodeClickTime = 0;
        // properly bind handleClickNode so it works on the nodes in the graph
        this.handleClickNode = this.handleClickNode.bind(this);
    }

    // called whenever a node is clicked
    handleClickNode(nodeName) {
        let node = getNodeById(nodeName, this.props.nodes);
        this.props.getLastClickedNode(node);
        // condition to treat it as a double click, if last click was within 1 second
        if (Date.now() - this.lastNodeClickTime < 1000 &&
            // and the same node was clicked both times,
            nodeName === this.lastNodeClicked) {
            // assuming we properly retrieved the node
            if (node !== null) {
                // open up its tab
                this.props.tabViewerActions.addTab(node.itemID, nodeName, node.type);
            }
        } else {
            // too long between clicks/different node clicked, it should be a single click
            // set last click to be now
            this.lastNodeClickTime = Date.now();
            // the clicked node is now the one that was last clicked
            this.lastNodeClicked = nodeName;
        }
    }

    render() {
        return (
            <Graph
                ref={"graphView"}
                // id is mandatory, if no id is defined rd3g will throw an error
                id="graph-id"
                // nodes + links to draw
                data={this.props.data}
                // settings for the graph
                config={{
                    // give it the base settings
                    ...settings,
                    // but override those with any passed settings
                    ...this.props.settings,
                }}
                // call the custom callback when a node is clicked
                onClickNode={this.handleClickNode.bind(this)}
            />
        );
    }
}

NexusGraph.propTypes = {
    "links": PropTypes.arrayOf(PropTypes.shape({
        "source": PropTypes.string.isRequired,
        "target": PropTypes.string.isRequired,
        "linkNode": PropTypes.any,
        "color": PropTypes.string,
        "label": PropTypes.string,
    })),
    "nodes": PropTypes.object.isRequired,
    "data": PropTypes.object.isRequired,
    "settings": PropTypes.object,
    "tabViewerActions": PropTypes.object.isRequired,
};

NexusGraph.defaultProps = {
    "nodes": [{"id": "blank"}],
};

function mapStateToProps(state) {
    return {
        "state": state.tabViewer,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        "tabViewerActions": bindActionCreators(tabViewerActions, dispatch),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NexusGraph);
