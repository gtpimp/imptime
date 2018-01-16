import React, { Component } from 'react'
import { connect } from 'react-redux'
import indexOf from 'lodash/indexOf'
import OtherUser from '../components/OtherUser'
import {
    updateIssueDescription,
    updateIssueSubject,
    deleteIssues,
    updateCandidateSubject,
    saveCandidateIssue,
    cancelCandidateIssue
} from '../actions/Issues'

import {
    fetchIssueGeneralDetailsIfNeeded
} from '../actions/IssueGeneralDetails'
import RIEModeToggler from '../widgets/RIEModeToggler'
import RIEInput from '../widgets/RIEInput'
import RIETextArea from '../widgets/RIETextArea'

class IssueDeveloperDetails extends Component {

    constructor(props) {
        super(props)
        this.onDelete = this.onDelete.bind(this)
	      this.onChangeSubject = this.onChangeSubject.bind(this)
	      this.onChangeDescription = this.onChangeDescription.bind(this)
	      this.onSaveCandidateIssue = this.onSaveCandidateIssue.bind(this)
	      this.onCancelCandidateIssue = this.onCancelCandidateIssue.bind(this)
    }

    componentDidMount() {
	      const { dispatch, issue_id } = this.props
	      if ( issue_id ) {
	          dispatch(fetchIssueGeneralDetailsIfNeeded([issue_id]))
	      }
    }

    componentWillReceiveProps() {
	      const { dispatch, issue_id } = this.props
	      if ( issue_id ) {
	          dispatch(fetchIssueGeneralDetailsIfNeeded([issue_id]))
	      }
    }

    onChangeSubject(issue_id, value) {
	      const { dispatch } = this.props
	      dispatch(updateIssueSubject(issue_id, value))
    }

    onChangeDescription(new_value) {
	      const { dispatch, issue_id } = this.props
	      dispatch(updateIssueDescription(issue_id, new_value))
    }

    onDelete() {
        const { dispatch, issue_id } = this.props
        if ( ! confirm( "Delete this issue?") ) {
            return false;
        }
	      dispatch(deleteIssues([issue_id]))
    }

    onSaveCandidateIssue(new_subject) {
	      const { dispatch } = this.props
	      dispatch(updateCandidateSubject(new_subject))
	      dispatch(saveCandidateIssue())
    }

    onCancelCandidateIssue() {
	      const { dispatch } = this.props
	      dispatch(cancelCandidateIssue())
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

    renderCreatingIssue() {
	      return (

	          <div className="issue_developer_details">
		          <div className="panel panel--full">
		            <div className="panel-heading">
			            <div className="panel__title">
			              New Issue
			            </div>
			            <div className="panel__buttons">
			              <div className="panel__button panel__button--delete"
				                 onClick={this.onCancelCandidateIssue}>
			              </div>
			            </div>
		            </div>
		            <div className="issue_developer_details__panel-body">

			            <h3>Subject: </h3>
			            <h3>
			              <RIEModeToggler
				              rie_key="issue_subject"
				              initialValue=""
				              initialState="editing"
				              onChange={this.onSaveCandidateIssue}
				              onCancel={this.onCancelCandidateIssue}
			              >
				              <RIEInput />
			              </RIEModeToggler>
			            </h3>
		            </div>
		          </div>
	          </div>
	      )
    }

    render() {

        const { is_visible, issue, comments, is_loading,
		            is_creating_issue, subject, description, number } = this.props

	      if ( ! is_visible ) {
	          return (<div></div>)
	      }

	      if ( is_creating_issue ) {
	          return this.renderCreatingIssue()
	      }

        return (
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
			            <h3>issue#{number}:

				            <RIEModeToggler
				                rie_key="issue_subject"
				                initialValue={subject || "..."}
				                onChange={(new_value) => this.onChangeSubject(issue.id, new_value)}
				            >
				              <RIEInput />
				            </RIEModeToggler>
			            </h3>
			            <RIEModeToggler
				            rie_key={"issue_description"}
				            initialValue={description || ""}
				            onChange={this.onChangeDescription}
			            >
				            <RIETextArea />
			            </RIEModeToggler>
			          </div>

			          <div>
			            { comments.map((comment) => this.renderComment(comment)) }
			          </div>
		          </div>
		        </div>
        )
    }
}

function mapStateToProps(state, props) {
    const state_issues = state.issue || {}
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

    const candidate_issue = state_issues.candidate_issue
    const is_creating_issue = candidate_issue || false

    return {
        issue_id: issue_id,
	      issue: issue,
	      comments: comments,
        is_loading: is_loading,
	      is_visible: issue_id || is_creating_issue || false,
	      is_creating_issue: is_creating_issue,
	      candidate_issue: candidate_issue,
        description: general_details.description,
        subject: issue.subject,
        number: issue.number
    }
}

export default connect(mapStateToProps)(IssueDeveloperDetails)
