import React, {Component} from 'react'
import {connect} from 'react-redux'
import { getIssue, ensureIssuesLoaded } from '../../actions/Issues'
import {browserHistory} from 'react-router'
import '../../sass/issue-label.css'

class IssueLabel extends Component {

    constructor(props) {
        super(props)
        this.onGotoIssue = this.onGotoIssue.bind(this)
    }
    
    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        if ( new_props.issue_id !== this.props.issue_id ) {
            this.refresh()
        }
    }

    refresh() {
        const { dispatch, issue_id } = this.props
        if ( issue_id ) {
            dispatch(ensureIssuesLoaded([issue_id]))
        }
    }

    onGotoIssue() {
        const { issue_id, sprint_id, project_id } = this.props
        browserHistory.push('/projects/' + project_id + '/sprints/' + sprint_id + '/issues/' + issue_id);
    }
    
    render() {
        const { issue } = this.props
        return (
            <div className="issue-label">
              { issue.id &&
                <div className="issue-label__number" onClick={this.onGotoIssue}>
                  #{issue.number}
                </div>
              }
              <div className="issue-label__subject">
                {issue.subject || "no feature"}
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { value } = props
    const issue_id = value
    const issue = getIssue(state, issue_id) || {}
    const sprint_id = issue.sprint_id
    const project_id = issue.project_id
    
    return {
        issue,
        issue_id,
        sprint_id,
        project_id
    }
}

export default connect(mapStateToProps)(IssueLabel)

