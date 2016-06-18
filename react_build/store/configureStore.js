import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import error_catcher_middleware from '../middleware/error_catcher'
import DevPageMiddleware from '../middleware/DevPageMiddleware'
import rootReducer from '../reducers'

export default function configureStore(initialState) {

    return createStore(
        rootReducer,
        initialState,
        compose(
            applyMiddleware(thunk,
			    DevPageMiddleware,
			    error_catcher_middleware),
            window.devToolsExtension ? window.devToolsExtension() : f => f
        )
    )
}
