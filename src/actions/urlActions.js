// keeps Redux tabViewer state in sync with the URL, so the active tab is
// deep-linkable (shareable/bookmarkable) and browser back/forward work
import history from "../history";
import {resolvePath, resolveNameForView} from "../data-stores/UrlModel";
import {addTab, switchTabs} from "./tabViewerActions";

/**
 * Resolve one URL path and dispatch whatever tabViewer action it implies
 * @param {String} pathname The path to resolve (basename already stripped)
 * @returns {Function} A thunk
 */
function applyPath(pathname) {
    return (dispatch, getState) => {
        const resolved = resolvePath(pathname);
        if (resolved === null) {
            console.warn(`Unrecognized URL "${pathname}"; redirecting to Home.`);
            history.replace("/");
            dispatch(switchTabs(0));
            return;
        }
        // if this path already matches the active tab, there's nothing to do
        // (this is also what stops the URL<->state sync from looping)
        const activeView = getState().tabViewer.views.find((view) => view.active);
        if (activeView && activeView.type === resolved.type && activeView.id === resolved.id) {
            return;
        }
        if (resolved.type === "Home") {
            dispatch(switchTabs(0));
            return;
        }
        const name = resolveNameForView(resolved);
        if (!name) {
            console.warn(`Could not resolve "${pathname}" to a valid item; redirecting to Home.`);
            history.replace("/");
            dispatch(switchTabs(0));
            return;
        }
        dispatch(addTab(resolved.id, name, resolved.type));
    };
}

/**
 * Apply the current URL to tabViewer state once, at startup.
 * A bare "/" is left alone -- whatever tab sessionStorage restored as active
 * stays active, and TabViewer pushes its path to the URL to match.
 * @returns {Function} A thunk
 */
export function syncUrlToTabs() {
    return (dispatch) => {
        if (history.location.pathname !== "/") {
            dispatch(applyPath(history.location.pathname));
        }
    };
}

/**
 * Subscribe to future URL changes (browser back/forward) and keep tabViewer
 * state in sync with them. Only needs to be set up once, at startup.
 * @returns {Function} A thunk
 */
export function watchUrlChanges() {
    return (dispatch) => {
        history.listen((location) => dispatch(applyPath(location.pathname)));
    };
}
