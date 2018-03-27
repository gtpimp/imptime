import { get } from 'lodash'

export const START_GLOBAL_COMMENT_ANNOTATION = "START_GLOBAL_COMMENT_ANNOTATION"
export const STOP_GLOBAL_COMMENT_ANNOTATION = "STOP_GLOBAL_COMMENT_ANNOTATION"

export function startGlobalCommentAnnotation(issue_id, comment_id) {
    return {
        type: START_GLOBAL_COMMENT_ANNOTATION,
        issue_id: issue_id,
        comment_id: comment_id
    }
}

export function stopGlobalCommentAnnotation() {
    return {
        type: STOP_GLOBAL_COMMENT_ANNOTATION,
    }
}

export function getGlobalCommentAnnotation(state) {
    return get(state, ['global_comment_annotation'], {})
}
