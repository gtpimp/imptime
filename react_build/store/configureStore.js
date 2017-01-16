import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import error_catcher_middleware from '../middleware/error_catcher'
import DevPageMiddleware from '../middleware/DevPageMiddleware'
import RefreshMiddleware from '../middleware/RefreshMiddleware'
import rootReducer from '../reducers'

export default function configureStore(initialState) {

    return createStore(
        rootReducer,
        initialState,
        compose(
            applyMiddleware(thunk,
			    DevPageMiddleware,
                            RefreshMiddleware,
			    error_catcher_middleware),
            window.devToolsExtension ? window.devToolsExtension() : f => f
        )
    )
}
