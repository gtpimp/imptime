import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import indexOf from 'lodash/indexOf'
import { fetchIssueGeneralDetailsIfNeeded } from '../actions/IssueGeneralDetails'


export class IssueDeveloperDetails extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
    }

    componentDidMount() {
	const { dispatch, issue_id } = this.props
	if ( issue_id ) {
	    dispatch(fetchIssueGeneralDetailsIfNeeded([issue_id]))
	}
    }

    onClickedSprint(sprint_id) {
	const { dispatch, list_key } = this.props
	dispatch(selectItems(list_key, [sprint_id]))
    }

    onRefresh() {
        const { dispatch, issue_id } = this.props
	dispatch(invalidateIssueGeneralDetails([issue_id]))
	dispatch(fetchIssueGeneralDetailsIfNeeded([issue_id]))
    }
    
    render() {

        const { issue_id, general_details, is_loading } = this.props
	const gd = general_details

        return (
            <div style={{ opacity: is_loading ? 0.5 : 1 }}>
		<div className="panel panel--wide">
                    <div className="panel-heading">
			<div className="panel__title">Issue Details</div>
			<div className="panel__buttons">
                            <div className="panel__button panel__button--refresh"
				 onClick={this.onRefresh}></div>
			</div>
                    </div>
                    <div className="panel-body">
			<h3>issue#{gd.number}: {gd.subject}</h3>
			<pre>
			    {gd.description}
			</pre>
                    </div>
		</div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const item_list = state.item_list || {}
    const issue_general_details = state.issue_general_details || {}
    const { list_key } = props
    const l = item_list[list_key] || {}
    const filter = l.filter || {}
    const issue_id = filter.issue_id
	
    const general_details = (issue_general_details.items_by_id || {})[issue_id] || {}
    const is_loading = indexOf(issue_general_details.loading_item_ids || [], issue_id) !== -1
    
    return {
        issue_id: issue_id,
	general_details: general_details,
        is_loading: general_details.is_loading
    }
}

export default connect(mapStateToProps)(IssueDeveloperDetails)
