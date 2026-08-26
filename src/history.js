// shared history singleton so both the Router and plain action/thunk code
// (outside the component tree) can read and push the same location
import {createBrowserHistory} from "history";

export default createBrowserHistory({
    "basename": "/folklorenexus",
});
