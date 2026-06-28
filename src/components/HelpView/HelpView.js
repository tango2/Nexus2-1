import "./HelpView.css";
import React from "react";
import {bindActionCreators} from "redux";
import * as tabViewerActions from "../../actions/tabViewerActions";
import connect from "react-redux/es/connect/connect";

class HelpView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "activeView": 0,
            ...props.state.views[props.viewIndex].state,
        };
        this.headers = [
            [
                "Getting Started",
                "Story View",
                "People, Places & Fieldtrips",
            ],
            [
                "Nexus Graph",
                "Search Features",
                "Macroscope Tools",
            ],
            [
                "How to Cite",
            ],
        ];
    }

    componentWillUnmount() {
        this.props.actions.updateTab(this.props.viewIndex, {
            "state": this.state,
        });
    }

    setView(activeView) {
        this.setState({ "activeView": -1 }, () => {
            requestAnimationFrame(() => {
                this.setState({ activeView });
            });
        });
    }

    renderHeader() {
        const rowLength = this.headers[0].length;
        return this.headers.map((row, index) => (
            <div className="grid-container" key={index}>
                <div className="grid-x grid-padding-x small-up-2 medium-up-3">
                    {row.map((title, offset) => (
                        <a
                            className="cell"
                            onClick={this.setView.bind(this, (index * rowLength) + offset)}
                            key={title}>
                            <h4 className="card card-section">{title}</h4>
                        </a>
                    ))}
                </div>
            </div>
        ));
    }

    render() {
        const {activeView} = this.state;
        return (
            <div className="HelpView">
                <div className="grid-container">
                    <h1>Need Help on...</h1>
                </div>
                {this.renderHeader()}
                <div id="mainContent">

                    {/* ── 0: GETTING STARTED ── */}
                    {activeView === 0 && <div>
                        <h1 id="gettingStarted">Getting Started</h1>
                        <p>
                            Welcome to the <strong>ETK Danish Folklore Nexus</strong> — a browser for Evald Tang
                            Kristensen's 19th-century Danish folklore collection, including thousands of stories,
                            the people who shared them, the places they named, and the fieldtrips ETK made to
                            record them.
                        </p>

                        <h2>The Home Tab</h2>
                        <img src={require("./images/navigatorhome.png")} alt="Home tab overview" />
                        <p>
                            The home tab is your starting point. The <strong>left panel</strong> holds two
                            navigators and a search bar. The <strong>center</strong> shows the current list of
                            items. The <strong>right panel</strong> shows the Nexus Graph and the Map.
                        </p>

                        <h2>Data Navigator</h2>
                        <img src={require("./images/navigator1.png")} alt="Data Navigator" />
                        <p>
                            Use the <strong>Data Navigator</strong> to browse Stories, People (informants),
                            Places, or Fieldtrips. Select a category — the matching items appear in the center
                            list. Click any item to open it in a new tab.
                        </p>

                        <h2>Topic &amp; Index Navigator</h2>
                        <img src={require("./images/navigator2.png")} alt="Topic and Index Navigator" />
                        <p>
                            The <strong>Topic &amp; Index Navigator</strong> organises stories by scholarly
                            classification systems: ETK's own indices, Professor Tangherlini's Tango Index,
                            genres, and keywords. Expand a category to filter the center list to matching
                            stories.
                        </p>

                        <h2>Timeline Filter</h2>
                        <img src={require("./images/timeline1.png")} alt="Timeline toggle" />
                        <p>
                            Enable the timeline filter with the toggle at the top of the left panel to restrict
                            the displayed results by fieldtrip year.
                        </p>
                        <img src={require("./images/timeline2.png")} alt="Timeline with date range" />
                        <p>
                            Drag the endpoints of the timeline bar to set a date range. Only stories and
                            fieldtrips within that period will appear in the center list.
                        </p>

                        <h2>Nexus Graph &amp; Map</h2>
                        <img src={require("./images/sidebar.png")} alt="Right panel with graph and map" />
                        <p>
                            The right panel shows a mini Nexus Graph (top) and the Map (bottom). As you open
                            more items, the graph grows to show their relationships. The map pins the locations
                            associated with whatever is currently displayed in the center list.
                        </p>
                        <img src={require("./images/nexus3.png")} alt="Map with place pins" />
                        <p>
                            Click a map pin to see the place name. Double-click to open the Place View tab for
                            that location.
                        </p>

                        <h2>Tabs</h2>
                        <img src={require("./images/tab1.png")} alt="Multiple open tabs" />
                        <p>
                            Every story, person, place, or fieldtrip you open gets its own tab at the bottom.
                            Drag tabs to reorder them.
                        </p>
                        <img src={require("./images/tab2.png")} alt="Pinned tab" />
                        <p>
                            Click the pin icon on a tab to pin it. Pinned tabs are preserved even when the
                            tab limit is reached, so you can keep important items visible.
                        </p>
                    </div>}

                    {/* ── 1: STORY VIEW ── */}
                    {activeView === 1 && <div>
                        <h1>Story View</h1>
                        <img src={require("./images/storyviewhome.png")} alt="Story View" />
                        <p>
                            The Story View opens when you click a story in the center list. It shows the
                            story text, associated metadata on the left, and related entities on the right.
                        </p>

                        <h2>Text Versions</h2>
                        <img src={require("./images/storyview3.png")} alt="Text version selector" />
                        <p>
                            Stories may exist in up to four versions: <em>English publication</em>,
                            <em>English manuscript</em>, <em>Danish publication</em>, and
                            <em>Danish manuscript</em>. Click the labels at the top to select a version.
                        </p>
                        <img src={require("./images/storyview4.png")} alt="Two text versions shown" />
                        <p>
                            Select two labels simultaneously to compare versions side by side. Click an
                            active label again to deselect it.
                        </p>

                        <h2>Left Bar — Indices &amp; Keywords</h2>
                        <img src={require("./images/storyview1.png")} alt="Left bar keywords" />
                        <p>
                            The left bar lists the ETK index categories, Tango Index entries, genres,
                            keywords, and places associated with the story.
                        </p>
                        <img src={require("./images/storyview2.png")} alt="Keyword navigation" />
                        <p>
                            Click any keyword or index tag to jump to the home tab and see all other stories
                            that share that classification.
                        </p>

                        <h2>Manuscript Pages</h2>
                        <img src={require("./images/manuscript1.png")} alt="Manuscript Pages tab" />
                        <p>
                            The <strong>Manuscript Pages</strong> tab (when available) shows scanned pages
                            from ETK's original field diary. Use the arrows or thumbnail strip to navigate
                            between pages.
                        </p>
                        <img src={require("./images/manuscript2.png")} alt="Manuscript lightbox with zoom" />
                        <p>
                            Click any page image to open the full-screen lightbox. Inside the lightbox,
                            <strong>scroll to zoom</strong> or click the image to step through zoom levels
                            (1×, 2×, 3×, 4×). Click the dark backdrop to reset zoom, or press
                            <kbd>Esc</kbd> to close.
                        </p>

                        <h2>Annotations &amp; Related Stories</h2>
                        <img src={require("./images/storyview5.png")} alt="Annotations and related stories" />
                        <p>
                            Scroll below the story text to find ETK's original annotations and a list of
                            related stories generated through network analysis.
                        </p>

                        <h2>Right Bar</h2>
                        <img src={require("./images/storyview6.png")} alt="Right bar" />
                        <p>
                            Click the grey pull-out bar on the right edge to open the entity panel.
                        </p>
                        <img src={require("./images/storyview7.png")} alt="Right bar — person" />
                        <p>
                            The <strong>Person</strong> section shows the informant who told the story,
                            with links to their biography.
                        </p>
                        <img src={require("./images/storyview8.png")} alt="Right bar — places" />
                        <p>
                            The <strong>Places</strong> section lists every location referenced in the story,
                            labelled by their relationship to the narrative.
                        </p>
                        <img src={require("./images/storyview9.png")} alt="Right bar — stories" />
                        <p>
                            The <strong>Stories</strong> section shows other stories told by the same
                            informant. Click any item to open it in a new tab.
                        </p>
                    </div>}

                    {/* ── 2: PEOPLE, PLACES & FIELDTRIPS ── */}
                    {activeView === 2 && <div>
                        <h1>People, Places &amp; Fieldtrips</h1>

                        <h2>Person View</h2>
                        <img src={require("./images/personviewhome.png")} alt="Person View" />
                        <p>
                            The Person View shows biographical information about an informant: birth and
                            death dates, hometown, occupation, and a short biography. The map pins all the
                            places mentioned in their stories. The right bar lists the fieldtrips they
                            participated in, the stories they told, and the places they named.
                        </p>

                        <h2>Place View</h2>
                        <img src={require("./images/placeviewhome.png")} alt="Place View" />
                        <p>
                            The Place View centres the map on the selected location and shows related
                            stories and informants. Blue pins mark places where a story was <em>mentioned</em>;
                            red pins mark where a story was <em>collected</em>.
                        </p>

                        <h3>Zooming &amp; Panning</h3>
                        <img src={require("./images/placeview1.png")} alt="Map zoom controls" />
                        <p>
                            Scroll to zoom, or use the +/− buttons in the top-left corner of the map.
                        </p>

                        <h3>Switching Map Layers</h3>
                        <img src={require("./images/placeview2.png")} alt="Layer switcher open" />
                        <img src={require("./images/placeview3.png")} alt="Historical map layer active" />
                        <p>
                            Click the layer icon in the top-right to choose between three basemaps:
                            <strong>Default OpenStreet Map</strong> (modern), <strong>High Boards</strong>
                            (high-resolution 19th-century Danish survey maps), and
                            <strong>Low Boards</strong> (lower-resolution historical boards). The historical
                            layers provide the geographic context ETK's informants would have known.
                        </p>

                        <h3>Right Bar</h3>
                        <img src={require("./images/placeview4.png")} alt="Place right bar" />
                        <p>
                            The right bar lists people associated with the place, stories that mention it,
                            and stories collected there.
                        </p>

                        <h2>Fieldtrip View</h2>
                        <img src={require("./images/fieldtripviewhome.png")} alt="Fieldtrip View" />
                        <p>
                            The Fieldtrip View maps all the locations ETK visited on a particular trip.
                            The right bar shows the people he met, the places he recorded, and the stories
                            he collected during the fieldtrip.
                        </p>
                    </div>}

                    {/* ── 3: NEXUS GRAPH ── */}
                    {activeView === 3 && <div>
                        <h1>Nexus Graph</h1>
                        <img src={require("./images/nexus_graph_small.jpeg")} alt="Nexus Graph in sidebar" />
                        <p>
                            As you open stories, people, places, and fieldtrips, they are automatically
                            added to the <strong>Nexus Graph</strong> — a network diagram that visualises
                            the relationships between everything you have explored. A compact version of
                            the graph appears in the upper-right panel of the Home tab, growing with each
                            new item you open.
                        </p>

                        <h2>Opening the Full Graph</h2>
                        <img src={require("./images/nexus_graph_large.jpeg")} alt="Full Nexus Graph tab" />
                        <p>
                            Click <strong>Open Graph in New Tab</strong> (upper-right of the sidebar) to
                            open the Nexus Graph in its own full-screen tab. The full view gives you room
                            to explore large networks and access the Display Options panel on the left.
                        </p>

                        <h2>Node Colors</h2>
                        <ul>
                            <li><strong style={{color:'#4a90d9'}}>Blue</strong> — People (informants)</li>
                            <li><strong style={{color:'#c0392b'}}>Red</strong> — Places</li>
                            <li><strong style={{color:'#888'}}>Grey</strong> — Stories</li>
                            <li><strong style={{color:'#4caf50'}}>Green</strong> — Fieldtrips</li>
                        </ul>

                        <h2>Link Types</h2>
                        <p>
                            <strong>Primary links</strong> connect items that are directly related — for
                            example, a story to the person who told it, or a story to a place it
                            mentions.<br />
                            <strong>Secondary links</strong> (labelled on the graph) indicate an indirect
                            relationship — for example, two stories connected because they were told by
                            the same person. Toggle each link type on or off in the Display Options panel.
                        </p>

                        <h2>Interacting with the Graph</h2>
                        <p>
                            <strong>Drag</strong> any node to rearrange the layout.
                            <strong> Double-click</strong> a node to jump directly to its detail tab.
                            Use the <strong>Download graph</strong> button at the bottom of the full-graph
                            tab to save the current network as an image.
                        </p>
                    </div>}

                    {/* ── 4: SEARCH FEATURES ── */}
                    {activeView === 4 && <div>
                        <h2>Search Features</h2>
                        <img src={require("./images/search1.png")} alt="Search results" />
                        <p>
                            The search bar at the top of the left panel searches the <strong>text of
                            stories</strong> currently shown in the center list. Type any word or phrase
                            and matching stories are ranked by relevance.
                        </p>

                        <h3>Boolean Operators</h3>
                        <img src={require("./images/search2.png")} alt="Boolean search" />
                        <p>
                            Combine terms with <code>AND</code>, <code>OR</code>, or <code>NOT</code>:
                        </p>
                        <ul>
                            <li><code>water AND spirit</code> — both words must appear</li>
                            <li><code>ghost OR apparition</code> — either word</li>
                            <li><code>mound NOT elf</code> — first word without the second</li>
                            <li><code>"hidden folk"</code> — exact phrase in quotes</li>
                        </ul>

                        <h3>Filter Chips</h3>
                        <img src={require("./images/search3.png")} alt="Filter chips" />
                        <p>
                            After a search, use the filter chips below the search bar to narrow results
                            by <strong>genre</strong> or <strong>collection</strong>. Click a chip to
                            toggle that filter on or off.
                        </p>

                        <h3>Cross-Collection Search</h3>
                        <p>
                            To search across <em>all</em> stories regardless of navigator selection, first
                            clear any active navigator filter, then type your query. The search bar always
                            operates on whatever the center list currently shows.
                        </p>
                    </div>}

                    {/* ── 5: MACROSCOPE TOOLS ── */}
                    {activeView === 5 && <div>
                        <h1>Macroscope Tools</h1>
                        <p>
                            The macroscope tools offer large-scale geographic and statistical views of the
                            entire ETK collection. Open them from the <strong>Macroscope</strong> tab in
                            the left navigator; each tool opens in its own tab.
                        </p>

                        <h2>WitchHunter &amp; TrollFinder</h2>
                        <img src={require("./images/macroscope_witchhunter_01.jpeg")} alt="WitchHunter interface" />
                        <p>
                            <strong>WitchHunter</strong> maps the geographic footprint of any folklore
                            category. Select one or more categories from the list on the left — the map
                            immediately plots every place mentioned in stories belonging to that category.
                            Pin clusters indicate locations mentioned frequently across the category.
                            Click any pin to see all stories from the selected category that reference
                            that place.
                        </p>
                        <p>
                            <strong>TrollFinder</strong> works on the same map: hold <kbd>Shift</kbd>
                            and drag to draw a bounding box over any region of Denmark. The tool queries
                            the spatial database and returns a ranked list of keywords that co-occur with
                            place names inside the drawn region, giving you a vocabulary profile for
                            that area. <em>Note: TrollFinder does not work reliably in Firefox — use
                            Chrome or Safari.</em>
                        </p>

                        <h2>ElfYelp</h2>
                        <img src={require("./images/macroscope_elfyelp_01.jpeg")} alt="ElfYelp overview" />
                        <p>
                            <strong>ElfYelp</strong> displays geo-topics derived from the full collection
                            using Latent Dirichlet Allocation (LDA). On the map:
                        </p>
                        <ul>
                            <li><strong>Red dots</strong> — places mentioned in ETK stories; darker shading
                            means more stories reference that place.</li>
                            <li><strong>Yellow circles</strong> — representative geographic regions for
                            automatically discovered topic clusters.</li>
                        </ul>
                        <img src={require("./images/macroscope_elfyelp_02.jpeg")} alt="ElfYelp topic breakdown after clicking a region" />
                        <p>
                            Click any yellow circle to see a breakdown of the dominant story topics
                            associated with that area — listed with percentage contributions — and to
                            highlight other regions of Denmark that share a similar topic mixture.
                            Hellinger distances show how closely each region matches the selected one.
                        </p>
                        <img src={require("./images/macroscope_elfyelp_03.jpeg")} alt="ElfYelp region keyword analysis" />
                        <p>
                            You can also draw a bounding box on the ElfYelp map to retrieve the top
                            keywords for any custom region, ranked both by raw frequency and by RF-IPF
                            score — a measure of how characteristic each word is of stories referencing
                            places in that area.
                        </p>

                        <h2>GhostScope &amp; TreasureX</h2>
                        <img src={require("./images/macroscope_ghostscope_01.jpeg")} alt="GhostScope map and charts" />
                        <p>
                            <strong>GhostScope</strong> visualises the collective <em>conceptual
                            geography</em> of a story category: it aggregates how storytellers directed
                            their spatial references — bearings, distances, and frequencies — placing
                            each storyteller at an origin point and mapping where they looked. Select a
                            category from the left panel and the map fills with directional arrows showing
                            place-reference vectors across all tellers in that category. Below the map, a
                            set of analytical charts summarises the collective pattern:
                        </p>
                        <img src={require("./images/macroscope_ghostscope_02.jpeg")} alt="GhostScope analytical charts" />
                        <ul>
                            <li><strong>Heat map</strong> — distance distribution of place references
                            (log scale), showing how far from home storytellers typically looked.</li>
                            <li><strong>Bearing polar charts</strong> (30° and 1° bins) — directional
                            distribution of all references, revealing dominant compass orientations in
                            the category's geographic imagination.</li>
                            <li><strong>Polar scatter plot</strong> — individual place references plotted
                            by bearing and distance, colour-coded by frequency.</li>
                            <li><strong>Distance histogram</strong> — normalised count of place references
                            at each distance, showing how narrative attention falls off with distance.</li>
                        </ul>
                        <p>
                            <strong>TreasureX</strong> accompanies GhostScope on the same map, overlaying
                            the actual source-to-destination arrows for individual place references within
                            the selected category, grounding the statistical summary in specific
                            storyteller-to-place movements.
                        </p>

                        <h2>Switching Basemaps</h2>
                        <p>
                            All three macroscope tools include a <strong>Basemap</strong> selector.
                            Choose between <em>Default OpenStreet Map</em>, <em>High Boards</em>, and
                            <em>Low Boards</em> — the same 19th-century Danish survey maps available
                            in Place View — to see ETK's data in its original geographic context.
                        </p>
                    </div>}

                    {/* ── 6: HOW TO CITE ── */}
                    {activeView === 6 && <div>
                        <h1>How to Cite</h1>

                        <h2>Citing the ETK Danish Folklore Nexus</h2>
                        <p>
                            Tangherlini, Timothy R., Pete Broadwell, and Daniel Huang.
                            <em> ETK Danish Folklore Nexus</em>. UCLA, 2024.{" "}
                            <a href="http://etkspace.scandinavian.ucla.edu/folklorenexus" target="_blank" rel="noopener noreferrer">
                                http://etkspace.scandinavian.ucla.edu/folklorenexus
                            </a>
                        </p>

                        <h2>Citing the Companion Book</h2>
                        <p>
                            Tangherlini, Timothy R.{" "}
                            <em>Danish Folktales, Legends and Other Stories</em>.
                            Seattle: University of Washington Press, 2013.
                        </p>

                        <h2>Citing an Individual Story</h2>
                        <p>
                            Stories in the Nexus are identified by their publication reference
                            (e.g., <code>DS_II_D_5</code>). To cite a specific story, use the
                            publication reference shown in the Story View header, together with
                            the collection it comes from:
                        </p>
                        <p>
                            Kristensen, Evald Tang. <em>[Collection title]</em>, [volume/number].
                            Story <code>[publication reference]</code>. Transcribed and translated
                            in Tangherlini, Timothy R. <em>Danish Folktales, Legends and Other
                            Stories</em>. Seattle: University of Washington Press, 2013.
                        </p>

                        <h2>Abbreviations</h2>
                        <p>
                            Publication references use standard abbreviations for ETK's collected
                            volumes. A full key to all abbreviations used in the Nexus is available
                            in the <strong>Abbreviations and Measurements</strong> section of the
                            companion book (accessible via the Book tab, Table of Contents).
                        </p>
                    </div>}

                    <div className="clearfix">
                        {activeView > 0 && (() => {
                            const prev = activeView - 1;
                            const row = Math.floor(prev / 3);
                            const col = prev % 3;
                            return (
                                <button
                                    className="button primary float-left"
                                    onClick={this.setView.bind(this, prev)}>
                                    &lt; Previous: {this.headers[row][col]}
                                </button>
                            );
                        })()}
                        {activeView < 6 && (() => {
                            const next = activeView + 1;
                            const row = Math.floor(next / 3);
                            const col = next % 3;
                            return (
                                <button
                                    className="button primary float-right"
                                    onClick={this.setView.bind(this, next)}>
                                    Next: {this.headers[row][col]} &gt;
                                </button>
                            );
                        })()}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({state: state.tabViewer});
const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(tabViewerActions, dispatch),
});
export default connect(mapStateToProps, mapDispatchToProps)(HelpView);
