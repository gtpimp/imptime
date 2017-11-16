import React, {Component} from 'react'
import {connect} from 'react-redux'
import { getIssue, ensureIssuesLoaded } from '../actions/Issues'

class IssueName extends Component {

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
            <div class="issue-name">
              { is_loading && "..." }
              { ! is_loading &&
              <div>
                {issue.number } {issue.subject}
              </div>
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


export default connect(mapStateToProps)(IssueName)
