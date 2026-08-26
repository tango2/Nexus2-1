// Bundles the app's sessionStorage state (open tabs + the NexusGraph) into a
// downloadable file, and restores it from one, so a session can be handed off
// to someone else and reopen the Nexus in the same state.
import FileSaver from "file-saver";
import history from "../history";
import {getSessionStorage, setSessionStorage} from "./SessionStorageModel";

// every sessionStorage key the app reads on startup or writes during use
export const SESSION_KEYS = [
    "TabViewerSessionState",
    "graphData",
    "nodeCategories",
    "SelectedNavOntology",
    "dropdownLists",
    "navigatorComponentState",
];

/**
 * Bundle every sessionStorage key the app uses and trigger a download of the result
 */
export function downloadSession() {
    const exportedAt = new Date().toISOString();
    const bundle = {
        "version": 1,
        exportedAt,
        "sessionStorage": SESSION_KEYS.reduce((acc, key) => {
            const value = getSessionStorage(key);
            if (value !== null) acc[key] = value;
            return acc;
        }, {}),
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], {"type": "application/json"});
    FileSaver.saveAs(blob, `folklore-nexus-session-${exportedAt.replace(/[:.]/g, "-")}.json`);
}

/**
 * Restore a session previously created by downloadSession(), then reload the
 * app at its root so every module (the Redux store, the NexusGraph singleton)
 * re-initializes fresh from the restored sessionStorage
 * @param {String} fileContents Raw text of the uploaded session file
 * @throws {Error} If the file isn't a valid session export
 */
export function loadSession(fileContents) {
    let bundle;
    try {
        bundle = JSON.parse(fileContents);
    } catch (parseError) {
        throw new Error("That file isn't valid JSON.");
    }
    if (!bundle || typeof bundle.sessionStorage !== "object" || bundle.sessionStorage === null) {
        throw new Error("That file doesn't look like a Nexus session export.");
    }
    SESSION_KEYS.forEach((key) => {
        const value = bundle.sessionStorage[key];
        if (value !== undefined && value !== null) {
            setSessionStorage(key, value);
        }
    });
    // a hard navigation (not history.push) -- pushing would fire the app's own
    // URL->state listener synchronously against the still-live (pre-import)
    // Redux store, which would immediately overwrite the sessionStorage we just wrote
    window.location.href = history.createHref({"pathname": "/"});
}
