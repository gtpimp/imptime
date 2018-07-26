import React, { Component } from 'react'
import { connect } from 'react-redux'
import {withRouter} from 'react-router-dom'
import classNames from 'classnames'
import { has_permission } from '../actions/Users'
import { map, keys, keyBy } from 'lodash'
import {
    ensureIssueHistoriesLoaded,
    getIssueHistory
} from '../actions/IssueHistories'
import { ensureIssuesLoaded, getIssue } from '../actions/Issues'
import OtherUser from './OtherUser'
import Timestamp from './Timestamp'
import { getCellStyle } from '../actions/ItemListKeyRegistry'

class IssueHistory extends Component {

    componentDidMount() {
	const { dispatch, issue_id, issue_history_id } = this.props
        if ( issue_id ) {
            dispatch(ensureIssuesLoaded([issue_id]))
        }
	dispatch(ensureIssueHistoriesLoaded([issue_history_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, issue_id, issue_history_id } = new_props
        if ( issue_id ) {
            dispatch(ensureIssuesLoaded([issue_id]))
        }
	dispatch(ensureIssueHistoriesLoaded([issue_history_id]))
    }

    render() {
        const { can_view, issue_history, is_loading, header_list } = this.props
        const headers_by_key = keyBy(header_list, "key")
        const visible_header_keys = keys(headers_by_key)

        if ( ! can_view ) {
            return (<div>"Missing permission to view this issue history"</div>)
        }
        
        if ( ! is_loading === false ) {
	    return (
		<div key={issue_history.id}
		     className={classNames("div-table__row")}
		>
		  <div className="div-table__cell">{issue_history && issue_history.id}</div>
		  <div className="div-table__cell">Loading...</div>
		</div>
	    )
        } else {
            return (
		<div key={this.key+"."+issue_history.id}
                     className={classNames('issue_history',
                                           'div-table__row')}
		>

                  { map(visible_header_keys, function(header_key) {
                        const header = headers_by_key[header_key]
                        switch(header_key) {
                            case "created_by":
                                return (
                                    <div className="div-table__cell" key={header_key}
                                         style={getCellStyle(header)}>
                                      <OtherUser user_id={issue_history.created_by_user_id} />
                                    </div>
                                )
                            case "created_at":
                                return (
                                    <div className="div-table__cell" key={header_key}
                                         style={getCellStyle(header)}>
                                      <Timestamp value={issue_history.created_at} format="from_now"/>
                                    </div>
                                )
                            case "description":
                                return (
                                    <div className="div-table__cell" key={header_key}
                                         style={getCellStyle(header)}>
                                      {issue_history.description}
                                    </div>
                                )
                            case "before":
                                return (
                                    <div className="div-table__cell" key={header_key}
                                         style={getCellStyle(header)}>
                                      {issue_history.before}
                                    </div>
                                )
                            case "after":
                                return (
                                    <div className="div-table__cell" key={header_key}
                                         style={getCellStyle(header)}>
                                      {issue_history.after}
                                    </div>
                                )
                            default:
                                console.error("Unknown header: " + header_key)
                                
                        }
                    }
                    )}
                </div>
            )
        }
    }
}

function mapStateToProps(state, props) {
    const { issue_history_id, header_list } = props
    const issue_history = getIssueHistory(state, issue_history_id) || {}
    const issue_id = issue_history.issue_id
    const issue = getIssue(state, issue_id)

    let can_view = true
    if ( issue_id && issue ) {
        const can_view_sensitive_histories = has_permission(state, issue.project_id, 'has_view_ctc_billable_rates')
        can_view = (has_permission(state, issue.project_id, 'has_view_issue_history') &&
                    (issue_history.money_sensitive === false || can_view_sensitive_histories))
    }
    
    return {
        issue_history,
        issue_id, 
        is_loading: !issue_history.id,
        header_list,
        can_view
    }
}

export default withRouter(connect(mapStateToProps)(IssueHistory))
