import React, { Component } from 'react'
import { connect } from 'react-redux'
import {DndTypes} from '../../actions/Dnd'
import {DragSource} from 'react-dnd';
import classNames from 'classnames'
import '../../sass/visual-spec-issue.scss'
import { getVisualSpecIssue } from '../../actions/VisualSpecIssues'
import { getIssue } from '../../actions/Issues'

class VisualSpecIssue extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps() {
        this.refresh()
    }

    refresh() {
    }

    render() {
        const { name, visual_spec_issue, issue, isDragging, connectDragSource } = this.props

        return connectDragSource(
            <div className={classNames("visual-spec-issue",
                                       {"visual-spec-issue--dragging": isDragging})}>
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

    return {
        visual_spec_issue,
        name: issue.subject || name
    }
}

const headingSource = {
    beginDrag(props) {
        return {id: props.visual_spec_issue_id || "new"}
    }
}

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    };
}

export default connect(mapStateToProps)(DragSource(DndTypes.VISUAL_SPEC_ISSUE, headingSource, collect)(VisualSpecIssue))

