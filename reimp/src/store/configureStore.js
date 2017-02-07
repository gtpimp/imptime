import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import error_catcher_middleware from '../middleware/error_catcher'
import RefreshMiddleware from '../middleware/RefreshMiddleware'
import rootReducer from '../reducers'
import { routerMiddleware } from 'react-router-redux'
import { browserHistory } from 'react-router'
const routingMiddleware = routerMiddleware(browserHistory)

export default function configureStore(initialState) {

    return createStore(
        rootReducer,
        initialState,
        compose(
            applyMiddleware(thunk,
                            routingMiddleware,
                            RefreshMiddleware,
			    error_catcher_middleware),
            window.devToolsExtension ? window.devToolsExtension() : f => f
        )
    )
}
