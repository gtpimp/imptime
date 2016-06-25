import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import map from 'lodash/map'
import { DragSource, DropTarget } from 'react-dnd';
import { connect } from 'react-redux'
import classNames from 'classnames'
import {
    updateIssueSubject,
    updateIssueStatus,
} from '../actions/Issue'
import {
    fetchUsersIfNeeded
} from '../actions/Users'
import RIEInput from '../widgets/RIEInput'
import RIEDropDown from '../widgets/RIEDropDown'
import RIEUserDropDown from '../widgets/RIEUserDropDown'
import OtherUser from '../components/OtherUser'
import { DndTypes } from '../actions/Dnd'

const ISSUE_STATUS_CHOICES = [
    { value: 'new', label: 'new'},
    { value: 'devdone', label: 'dev_done'},
    { value: 'in_internal_qa', label: 'internal qa'},
    { value: 'internal_qa_passed', label: 'internal qa passed'},
    { value: 'in_client_qa', label: 'external qa'},
    { value: 'client_qa_passed', label: 'external qa passed'},
    { value: 'reopened', label: 'reopened'},
    { value: 'onhold', label: 'on hold'},
    { value: 'bug', label: 'bug'},
    { value: 'to be estimated', label: 'to be estimated'},
    { value: 'needscodereview', label: 'needs code review'},
    { value: "cannot reproduce", label: "cannot reproduce"},
    { value: "discuss with client", label: "discuss with client"},
    { value: 'dev unclear', label: 'dev unclear'},
    { value: 'duplicate', label: 'duplicate'},
    { value: 'to be designed', label: 'to be designed'},
    { value: 'imported', label: 'imported'},
    { value: 'management', label: 'management'},
    { value: 'quick_clocker', label: 'quick clocker'}
]

export class Issue extends Component {

    constructor(props) {
        super(props)
	this.onChangeSubject = this.onChangeSubject.bind(this)
	this.onChangeStatus = this.onChangeStatus.bind(this)
    }

    componentDidMount() {
	const { dispatch, assignable_user_ids } = this.props
	dispatch(fetchUsersIfNeeded(assignable_user_ids))

    }
    
    onChangeSubject(issue_id, obj) {
	const { dispatch } = this.props
	dispatch(updateIssueSubject(issue_id, obj.subject))
    }

    onChangeStatus(issue_id, obj) {
	const { dispatch } = this.props
	dispatch(updateIssueStatus(issue_id, obj.status))
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
        const { issue, is_loading, is_selected, onClickedIssue, assignable_user_ids,
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
			<RIEUserDropDown value={issue.assigned_to_id}
					 propName="assigned_to"
					 user_ids={assignable_user_ids}
					 change={(obj) => this.onChangeAssignedTo(issue.id, obj)}
			/>
		    </td>
		    <td>{issue.feature_name}</td>
		    <td>
			<RIEDropDown value={issue.status || "..."}
				     propName="status"
				     options={ISSUE_STATUS_CHOICES}
				     change={(obj) => this.onChangeStatus(issue.id, obj)}
			/>
		    </td>
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
    const { project, issue, item_list, user } = state
    const { issue_id, is_selected, is_collapsed, is_loading } = props

    const this_issue = (issue && issue.items_by_id && issue.items_by_id[issue_id]) || {'loaded':false}
    const project_id = this_issue.project_id
    const this_project = (project && project.items_by_id && project.items_by_id[project_id]) || {}
    const assignable_user_ids = this_project.allowed_user_ids || []
    
    return {
	issue: this_issue,
	issue_id: issue_id,
	is_selected: is_selected,
	is_loading: is_loading,
	is_collapsed: is_collapsed,
	is_expanded: !is_collapsed,
	assignable_user_ids: assignable_user_ids
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
