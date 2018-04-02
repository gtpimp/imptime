import React, {Component} from 'react'
import {connect} from 'react-redux'
import { getIssue, ensureIssuesLoaded } from '../actions/Issues'
import {withRouter} from 'react-router-dom'

class IssueStatus extends Component {

    componentDidMount() {
        const { dispatch, issue_id } = this.props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, issue_id } = new_props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    render() {
        const { issue, is_loading } = this.props

        return (
            <div className="issue-name">
              { is_loading && "..." }
              { ! is_loading &&
                <div>{issue.status_name}</div>
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    
    const { issue_id } = props
    const issue = getIssue(state, issue_id)
    
    return {
        issue,
        is_loading: !issue || !issue.id
    }
}


export default connect(mapStateToProps)(IssueStatus)

