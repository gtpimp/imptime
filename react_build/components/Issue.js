import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import map from 'lodash/map'
import { DragSource, DropTarget } from 'react-dnd';
import { connect } from 'react-redux'
import classNames from 'classnames'
import {
    updateIssueSubject
} from '../actions/Issue'
import RIEInput from '../widgets/RIEInput'
import OtherUser from '../components/OtherUser'
import { DndTypes } from '../actions/Dnd'

export class Issue extends Component {

    constructor(props) {
        super(props)
	this.onChangeSubject = this.onChangeSubject.bind(this)
    }
    
    onChangeSubject(issue_id, obj) {
	const { dispatch } = this.props
	dispatch(updateIssueSubject(issue_id, obj.subject))
    }

    render_collapsed() {
	const { issue, list_key } = this.props
	return (
	    <div key={"collapsed_issue_"+issue.id+"_"+list_key}>
		{issue.number}
		{issue.subject}
	    </div>
	)
    }
    
    render_expanded() {
        const { issue, is_loading, is_selected, onClickedIssue,
		isOver, connectDragSource, connectDropTarget } = this.props

	if ( ! issue ) {
	    return (<tr><td>Loading...</td></tr>)
	}

	if ( issue.loaded === false ) {
	    return (
		<tr key={this.key+"."+issue.id}
		    onClick={onClickedIssue}
		    className={classNames({'tr--selected': is_selected, 'tr--drop-target': isOver})}
		>
		    <td><div className="issue_list__issue_number_button">{issue.number}</div></td>
		    <td>Loading...</td>
		</tr>
	    )
	} else {
	    return connectDragSource(connectDropTarget(
		<tr key={this.key+"."+issue.id}
		    onClick={onClickedIssue}
		    className={classNames({'tr--selected': is_selected, 'tr--drop-target': isOver})}
		>
		    <td>
			<div className="issue_list__issue_number_button">{issue.number}</div>
		    </td>
		    <td>
			<RIEInput value={issue.subject}
				  propName="subject" 
				  change={(obj) => this.onChangeSubject(issue.id, obj)} />
		    </td>
		    <td>
			<OtherUser user_id={issue.assigned_to_id}
				   render_mode="inline--small"
				   loading_value={issue.assigned_to_quick_name} />
		    </td>
		    <td>{issue.feature_name}</td>
		    <td>{issue.status}</td>
		</tr>
	    ))
	}
    }

    render() {
        const { is_collapsed, is_expanded } = this.props

	if ( is_collapsed ) {
	    return this.render_collapsed()
	}
	else if ( is_expanded ) {
	    return this.render_expanded()
	} else {
	    return ( <div>Dev error</div> )
	}
    }

}

function mapStateToProps(state, props) {
    const { issue, item_list } = state
    const { issue_id, is_selected, is_collapsed, is_loading } = props

    const this_issue = (issue && issue.items_by_id && issue.items_by_id[issue_id]) || {'loaded':false}
    
    return {
	issue: this_issue,
	issue_id: issue_id,
	is_selected: is_selected,
	is_loading: is_loading,
	is_collapsed: is_collapsed,
	is_expanded: !is_collapsed
    }

}

const headingSource = {
    beginDrag(props) {
	return { id: props.issue_id }
    }
}

const headingTarget = {
    drop: (props, monitor, component) => {
	const { issue_id } = props
	const dragging_item = monitor.getItem()
	if ( ! dragging_item ) {
	    return;
	}
	const dragging_issue_id = dragging_item.id
	if ( issue_id == dragging_issue_id ) {
	    console.log("ignoring dnd on the same element: " + issue_id)
	    return;
	}
	
	props.reorderIssue(dragging_issue_id, issue_id)
    },
    hover: (props, monitor, component) => {
    },
    canDrop: (props, monitor) => {
	return true;
    }
    
}

function collect(connect, monitor) {
    return {
	connectDragSource: connect.dragSource(),
	isDragging: monitor.isDragging()
    };
}

function collectDrop(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    }
}

export default connect(mapStateToProps) (DragSource(DndTypes.ISSUE, headingSource, collect) (DropTarget(DndTypes.ISSUE, headingTarget, collectDrop)(Issue)))
