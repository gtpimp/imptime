import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import indexOf from 'lodash/indexOf'
import map from 'lodash/map'
import RIETextArea from '../widgets/RIETextArea'
import OtherUser from '../components/OtherUser'
import {
    updateIssueDescription,
    deleteIssue
} from '../actions/Issue'

import {
    invalidateIssueGeneralDetails,
    fetchIssueGeneralDetailsIfNeeded
} from '../actions/IssueGeneralDetails'
import { Sticky } from 'react-sticky';

export class IssueDeveloperDetails extends Component {

    constructor(props) {
        super(props)
        this.onDelete = this.onDelete.bind(this)
	this.onChangeDescription = this.onChangeDescription.bind(this)
    }

    componentDidMount() {
	const { dispatch, issue_id, issue } = this.props
	if ( issue_id ) {
	    dispatch(fetchIssueGeneralDetailsIfNeeded([issue_id]))
	}
    }

    onChangeDescription(obj) {
	const { dispatch, issue_id } = this.props
	dispatch(updateIssueDescription(issue_id, obj.description))
    }

    onDelete() {
        const { dispatch, issue_id } = this.props
	dispatch(deleteIssue(issue_id))
    }

    renderComment(comment) {
	return (
	    <div key={"comment_"+comment.id} className="issue_developer_details__commment">
		<div>
		    {comment.comment}
		</div>
		<div className="issue_developer_details__comment__author">By <OtherUser user_id={comment.author_id} /></div>
		<div className="issue_developer_details__comment__created">At {comment.created}</div>
		<div className="issue_developer_details__comment__separator">&nbsp;</div>
	    </div>
	)
    }
    
    render() {

        const { is_visible, issue_id, issue, comments, is_loading } = this.props

	if ( ! is_visible ) {
	    return (<div></div>)
	}
	
        return (
	    <Sticky>
		<div className="issue_developer_details" style={{ opacity: is_loading ? 0.5 : 1 }}>
		    <div className="panel panel--full">
			<div className="panel-heading">
			    <div className="panel__title">
				Issue Details
			    </div>
			    <div className="panel__buttons">
				<div className="panel__button panel__button--delete"
				     onClick={this.onDelete}>
				</div>

			    </div>
			</div>
			<div className="issue_developer_details__panel-body">
			    <h3>issue#{issue.number}: {issue.subject}</h3>
				<RIETextArea
				    value={issue.description || ""}
				    propName="description"
				    change={this.onChangeDescription}
				/>
			</div>

			<div>
			    { comments.map((comment) => this.renderComment(comment)) } 
			</div>
		    </div>
		</div>
	    </Sticky>
        )
    }
}

function mapStateToProps(state, props) {
    const item_list = state.item_list || {}
    const { list_key } = props
    const l = item_list[list_key] || {}
    const filter = l.filter || {}
    const issue_id = filter.issue_id

    const issue_general_details = state.issue_general_details || {}
    const general_details = (issue_general_details.items_by_id || {})[issue_id] || {}
    const is_loading = indexOf(issue_general_details.loading_item_ids || [], issue_id) !== -1

    const issues = (state.issue || {}).items_by_id || {}
    let issue = issues[issue_id] || {}

    issue = Object.assign({},
			  issue,
			  general_details)

    const comments = issue.issue_comments || []
    
    return {
        issue_id: issue_id,
	issue: issue,
	comments: comments,
        is_loading: general_details.is_loading,
	is_visible: issue_id || false
    }
}

export default connect(mapStateToProps)(IssueDeveloperDetails)
