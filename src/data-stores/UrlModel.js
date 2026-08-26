// Maps between tab-viewer views ({id, type}) and shareable URL paths, so the
// active tab can be linked to directly (deep-linking / breadcrumbing).
import {
    getStoryByID,
    getPeopleByID,
    getPlacesByID,
    getFieldtripsByID,
    ontologyToDisplayKey,
} from "./DisplayArtifactModel";
import {PersonIDToChapterID} from "../components/PeopleView/PeopleView";
import {MACROSCOPE_TOOLS} from "../components/Navigation/NavigatorComponent";

// per-type path segment + how to read/write its id
const TYPE_META = {
    "Home": {"path": "", "hasId": false},
    "Stories": {"path": "story", "hasId": true, "idType": "number"},
    "People": {"path": "person", "hasId": true, "idType": "number"},
    "Places": {"path": "place", "hasId": true, "idType": "number"},
    "Fieldtrips": {"path": "fieldtrip", "hasId": true, "idType": "number"},
    "Graph": {"path": "graph", "hasId": false},
    "Help": {"path": "help", "hasId": false},
    "Book": {"path": "book", "hasId": true, "idType": "number"},
    // the tool can be opened generically (id 0) or pre-loaded with a fieldtrip (id = fieldtrip_id)
    "FieldtripTool": {"path": "fieldtriptool", "hasId": true, "idType": "number", "idOptional": true},
    "Macroscope": {"path": "macroscope", "hasId": true, "idType": "string"},
};

// reverse lookup: path segment -> tab type
const PATH_TO_TYPE = Object.keys(TYPE_META).reduce((acc, type) => {
    const {path} = TYPE_META[type];
    if (path) acc[path] = type;
    return acc;
}, {});

// getters for the four core PPFS entity types, keyed the same way ontologyToDisplayKey is
const PPFS_GETTERS = {
    "Stories": getStoryByID,
    "People": getPeopleByID,
    "Places": getPlacesByID,
    "Fieldtrips": getFieldtripsByID,
};

// built once: chapterID -> personID, inverse of PersonIDToChapterID
const ChapterIDToPersonID = Object.keys(PersonIDToChapterID).reduce((acc, personID) => {
    acc[PersonIDToChapterID[personID]] = personID;
    return acc;
}, {});

/**
 * Build the shareable URL path for a tabViewer view
 * @param {Object} view A view from tabViewer state ({id, type, ...})
 * @returns {String} The path (e.g. "/story/12"), or "/" if the type is unrecognized
 */
export function getPathForView(view) {
    const meta = view && TYPE_META[view.type];
    if (!meta || !meta.path) return "/";
    if (!meta.hasId) return `/${meta.path}`;
    if (meta.idOptional && (view.id === 0 || view.id === undefined || view.id === null)) {
        return `/${meta.path}`;
    }
    return `/${meta.path}/${view.id}`;
}

/**
 * Parse a URL path into a {type, id} pair
 * @param {String} pathname The current location's pathname (basename already stripped by history)
 * @returns {Object|null} {type, id}, or null if the path doesn't match a known tab type
 */
export function resolvePath(pathname) {
    const segments = pathname.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
    if (segments.length === 0) return {"type": "Home", "id": 0};
    const [pathKey, idSegment] = segments;
    const type = PATH_TO_TYPE[pathKey];
    if (!type) return null;
    const meta = TYPE_META[type];
    if (!meta.hasId) return {type, "id": 0};
    if (idSegment === undefined) {
        return meta.idOptional ? {type, "id": 0} : null;
    }
    if (meta.idType === "number") {
        const id = Number(idSegment);
        return Number.isFinite(id) ? {type, id} : null;
    }
    // string id (Macroscope)
    return {type, "id": idSegment};
}

/**
 * Resolve the display name for a {type, id} pair, the same way each caller of
 * tabViewerActions.addTab already derives a tab's name today
 * @param {Object} resolved {type, id} from resolvePath
 * @returns {String|null} The display name, or null if the id doesn't refer to a real item
 */
export function resolveNameForView({type, id}) {
    if (PPFS_GETTERS[type]) {
        const item = PPFS_GETTERS[type](id);
        return item ? item[ontologyToDisplayKey[type]] : null;
    }
    switch (type) {
        case "Home": return "Home";
        case "Graph": return "Nexus Graph";
        case "Help": return "Help";
        case "FieldtripTool": return "Fieldtrip Tool";
        case "Book": {
            const personID = ChapterIDToPersonID[id];
            if (personID === undefined) return null;
            const person = getPeopleByID(Number(personID));
            return person ? person.full_name : null;
        }
        case "Macroscope": {
            const tool = MACROSCOPE_TOOLS.find((candidate) => candidate.id === id);
            return tool ? tool.name : null;
        }
        default: return null;
    }
}
