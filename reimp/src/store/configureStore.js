import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import error_catcher_middleware from '../middleware/error_catcher'
import RefreshMiddleware from '../middleware/RefreshMiddleware'
import rootReducer from '../reducers'

export default function configureStore(initialState) {

    return createStore(
        rootReducer,
        initialState,
        compose(
            applyMiddleware(thunk,
                            RefreshMiddleware,
			    error_catcher_middleware),
            window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f
        )
    )
}
