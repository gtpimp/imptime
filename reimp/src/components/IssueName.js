import React, {Component} from 'react'
import {connect} from 'react-redux'
import { getIssue, ensureIssuesLoaded } from '../actions/Issues'
import {withRouter, Link} from 'react-router-dom'

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
        const { issue, onClick } = this.props
        if ( onClick ) {
            event.stopPropagation()
            onClick(issue.id)
        }
    }
    
    render() {
        const { issue, is_loading, open_on_click } = this.props

        return (
            <div className="issue-name">
              { is_loading && "..." }
              { ! is_loading && open_on_click &&
                <Link to={'/projects/' + issue.project_id + "/sprints/" + issue.sprint_id + "/issues/" + issue.id}>
                  #{issue.number } {issue.subject}
                </Link>
              }
              { ! is_loading && !open_on_click &&
                <div className="issue-name__link" onClick={this.on_clicked}>
                  #{issue.number } {issue.subject}
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
        open_on_click: !props.onClick && props.open_on_click !== false
    }
}


export default withRouter(connect(mapStateToProps)(IssueName))
