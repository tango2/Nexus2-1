import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { Provider } from 'react-redux';
import configureStore from './data-stores/configureStore';
import { syncUrlToTabs, watchUrlChanges } from './actions/urlActions';

const store = configureStore();

// resolve a deep-linked URL (if any) before the first render, then keep
// tabViewer state and the URL in sync going forward
store.dispatch(syncUrlToTabs());
store.dispatch(watchUrlChanges());

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>
    , document.getElementById('root'));
registerServiceWorker();
