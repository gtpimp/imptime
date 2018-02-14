import React, {Component} from 'react'
import {connect} from 'react-redux'
import { getIssue, ensureIssuesLoaded } from '../actions/Issues'
import {browserHistory} from 'react-router'

class IssueName extends Component {

    constructor(props) {
        super(props)
        this.on_clicked = this.on_clicked.bind(this)
    }
    
    componentDidMount() {
        const { dispatch, issue_id } = this.props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, issue_id } = new_props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    on_clicked(event) {
        const { issue, onClick, open_on_click } = this.props
        event.stopPropagation()
        if ( onClick ) {
            onClick(issue.id)
        } else if ( open_on_click ) {
            browserHistory.push('/projects/' + issue.project_id + "/sprints/" + issue.sprint_id + "/issues/" + issue.id);
        }
    }
    
    render() {
        const { issue, is_loading } = this.props

        return (
            <div className="issue-name">
              { is_loading && "..." }
              { ! is_loading &&
              <div className="issue-name__link" onClick={this.on_clicked}>
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
        is_loading: !issue || !issue.id,
        onClick: props.onClick,
        open_on_click: props.open_on_click || true
    }
}


export default connect(mapStateToProps)(IssueName)
