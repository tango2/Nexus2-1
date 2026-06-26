import React, {Component} from "react";
import "./MacroscopeView.css";

const MACROSCOPE_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8765"
    : "https://scando.ist.berkeley.edu/maps";

const TOOL_PATHS = {
    "witchhunter": "/witchhunter.html",
    "ghostscope": "/ghostscope.html",
    "elfyelp": "/ElfYelp/ElfYelp.html",
};

class MacroscopeView extends Component {
    render() {
        const {id} = this.props;
        const toolPath = TOOL_PATHS[id];
        if (!toolPath) {
            return <div className="MacroscopeView-error">Unknown macroscope tool: {id}</div>;
        }
        const src = MACROSCOPE_BASE + toolPath;
        return (
            <div className="MacroscopeView">
                <iframe
                    src={src}
                    title={id}
                    className="MacroscopeView-frame"
                    allowFullScreen
                />
            </div>
        );
    }
}

export default MacroscopeView;
