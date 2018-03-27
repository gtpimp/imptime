import {
    START_GLOBAL_COMMENT_ANNOTATION,
    STOP_GLOBAL_COMMENT_ANNOTATION
} from '../actions/GlobalCommentAnnotation'

const initialState = {
    issue_id: null,
    comment_id: null
}

export default function global_comment_annotation(state = initialState, action) {

    switch (action.type) {
        case START_GLOBAL_COMMENT_ANNOTATION:
            return Object.assign({}, state,
                                 {issue_id: action.issue_id,
                                  comment_id: action.comment_id})

        case STOP_GLOBAL_COMMENT_ANNOTATION:
            return Object.assign({}, state, {issue_id: null, comment_id: null})
            
        default:
            return state
    }

}
