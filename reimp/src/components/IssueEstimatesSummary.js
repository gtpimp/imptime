import React, { Component } from 'react'
import { connect } from 'react-redux'
import { map } from 'lodash'
import {
    ensureIssuesLoaded, getIssue
} from '../actions/Issues'
import {withRouter} from 'react-router-dom'
import OtherUser from './OtherUser'
import Hours from './Hours'
import '../sass/issue-estimate-summary.scss'

class IssueEstimatesSummary extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
	const { dispatch, issue_id, issue } = props
	if ( issue.loaded === false ) {
	    dispatch(ensureIssuesLoaded([issue_id]))
	}
    }

    render_inline_small() {
	const { issue, loading_value } = this.props

	return (
	    <div className="issue_estimate_summary--inline-small"
                 key={issue.id}
	    >
              {map(issue.all_estimates, function (estimate, index) {
                   if (estimate.estimate_hours && estimate.user_id) {
                       return (
                           <div key={estimate.user_id} className="issue_estimate_summary__estimate-entry" >
                             <OtherUser user_id={estimate.user_id} />
                             <Hours hours={estimate.estimate_hours} />
                           </div>
                       )
                   } else {
                       return null
                   }
               })}
	    </div>
	)
    }

    render() {
        const { issue_id, issue, render_mode, loading_value } = this.props

        if ( ! issue_id ) {
            return null
        }

	if ( issue.loaded === false ) {
	    return ( <div>{loading_value}</div> )
	}

	if ( render_mode === 'inline--small' ) {
	    return this.render_inline_small()
	} else {
	    return ( <div>Dev error, unsupported render mode: {render_mode}</div> )
	}
    }
}

function mapStateToProps(state, props) {
    const { issue_id, render_mode, loading_value } = props
    const issue = ((issue_id && (getIssue(state, issue_id))) || { 'loaded': false, 'id': issue_id }) || { 'estimate': null }

    return {
	issue: issue,
        issue_id: issue_id,
	render_mode: render_mode || "inline--small",
	loading_value: loading_value || "..."
    }
}

export default connect(mapStateToProps)(IssueEstimatesSummary)
