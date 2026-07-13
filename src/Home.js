import React, {Component} from "react";
import TabViewer from "./components/TabViewer/TabViewer";
import Heading from "./components/Heading/Heading.js";

class Home extends Component {
    constructor() {
        super();
        // start in a state of loading
        this.state = {
            "loading": true,
        };
    }

    componentDidMount() {
        // simulate async action and remove loader
        setTimeout(() => this.setState({"loading": false}), 1500);
    }

    render() {
        return (
            <div className="Home grid-y medium-grid-frame full">
                {/* lets keyboard users jump past the header straight to the tab content */}
                <a className="skip-link" href="#main-content">Skip to main content</a>
                {/* without nested div, the Book View gets mega-compressed */}
                <div>
                    {/* Top banner with flag + title on left, book icon on right */}
                    <header>
                        <Heading />
                    </header>
                    {/* Everything else on the page */}
                    <main id="main-content">
                        <TabViewer />
                    </main>
                </div>
            </div>
        );
    }
}

export default Home;