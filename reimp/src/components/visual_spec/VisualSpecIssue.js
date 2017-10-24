import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReactDOM from 'react-dom';
import {DndTypes} from '../../actions/Dnd'
import {DragSource} from 'react-dnd';
import classNames from 'classnames'
import '../../sass/visual-spec-issue.scss'
import { getVisualSpecIssue } from '../../actions/VisualSpecIssues'
import { getIssue } from '../../actions/Issues'
import {
    createVisualSpecIssue,
    updateVisualSpecIssue,
    ensureVisualSpecIssuesLoaded,
    is_visual_spec_issue_invalidated
} from '../../actions/VisualSpecIssues'

class VisualSpecIssue extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(props) {
        this.refresh(props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, visual_spec_issue_id } = props
        if ( visual_spec_issue_id ) {
            dispatch(ensureVisualSpecIssuesLoaded([visual_spec_issue_id]))
        }
    }

    render() {
        const { name, visual_spec_issue, issue, isDragging, connectDragSource } = this.props

        const style = {}
        if ( !isDragging && visual_spec_issue.x_pos ) {
            style.top = visual_spec_issue.y_pos
            style.left = visual_spec_issue.x_pos
        }
        
        return connectDragSource(
            <div className={classNames("visual-spec-issue",
                                       {"visual-spec-issue--dragging": isDragging})}
                 style={style}
            >
              {name}
              { isDragging && <span>(here I go)</span> }
              { !isDragging && <span>(not moving)</span> }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { name, visual_spec_issue_id } = props
    const visual_spec_issue = getVisualSpecIssue(state, visual_spec_issue_id) || {}
    const issue = (visual_spec_issue.issue_id && getIssue(state, visual_spec_issue.issue_id)) || {}
    const is_invalidated = is_visual_spec_issue_invalidated(state, visual_spec_issue_id)

    return {
        visual_spec_issue_id,
        visual_spec_issue,
        name: issue.subject || name,
        is_invalidated: is_invalidated || false
    }
}

const headingSource = {
    beginDrag(props, monitor, component) {
        return {
            id: props.visual_spec_issue_id || "new"
        }
    },
    endDrag(props, monitor, component) {
        const { dispatch, visual_spec_issue } = props
        const drop_result = monitor.getDropResult()
        const { child_pos, visual_spec_document_id, parent_pos, distance_moved } = drop_result
        let x_pos
        let y_pos
        if ( props.visual_spec_issue_id ) {
            x_pos = visual_spec_issue.x_pos + distance_moved.x
            y_pos = visual_spec_issue.y_pos + distance_moved.y
            dispatch(updateVisualSpecIssue(visual_spec_document_id, [props.visual_spec_issue_id], "pointer", x_pos, y_pos))
        } else {
            x_pos = child_pos.x - parent_pos.left
            y_pos = child_pos.y - parent_pos.top
            dispatch(createVisualSpecIssue(visual_spec_document_id, "pointer", x_pos, y_pos))
        }
    }
}

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    };
}

export default connect(mapStateToProps)(DragSource(DndTypes.VISUAL_SPEC_ISSUE, headingSource, collect)(VisualSpecIssue))

