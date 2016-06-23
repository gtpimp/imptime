import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import indexOf from 'lodash/indexOf'
import { RIETextArea } from '../widgets/RIETextArea'
import {
    updateIssueDescription,
} from '../actions/Issue'

import {
    invalidateIssueGeneralDetails,
    fetchIssueGeneralDetailsIfNeeded
} from '../actions/IssueGeneralDetails'


export class IssueDeveloperDetails extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
	this.onChangeDescription = this.onChangeDescription.bind(this)
    }

    componentDidMount() {
	const { dispatch, issue_id } = this.props
	if ( issue_id ) {
	    dispatch(fetchIssueGeneralDetailsIfNeeded([issue_id]))
	}
    }

    onChangeDescription(obj) {
	const { dispatch, issue_id } = this.props
	dispatch(updateIssueDescription(issue_id, obj.description))
    }

    onRefresh() {
        const { dispatch, issue_id } = this.props
	dispatch(invalidateIssueGeneralDetails([issue_id]))
	dispatch(fetchIssueGeneralDetailsIfNeeded([issue_id]))
    }
    
    render() {

        const { is_visible, issue_id, issue, is_loading } = this.props

	if ( ! is_visible ) {
	    return (<div></div>)
	}
	
        return (
            <div className="issue_developer_details" style={{ opacity: is_loading ? 0.5 : 1 }}>
		<div className="panel panel--full">
                    <div className="panel-heading">
			<div className="panel__title">
			    Issue Details
			</div>
			<div className="panel__buttons">
                            <div className="panel__button panel__button--refresh"
				 onClick={this.onRefresh}></div>
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
		</div>
            </div>
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
    
    return {
        issue_id: issue_id,
	issue: issue,
        is_loading: general_details.is_loading,
	is_visible: issue_id || false
    }
}

export default connect(mapStateToProps)(IssueDeveloperDetails)
