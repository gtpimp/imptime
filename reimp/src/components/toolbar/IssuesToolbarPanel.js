import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../../sass/toolbar-panel.css'
import {browserHistory} from 'react-router'
import {
    startCandidateIssue,
    ensureIssuesLoaded,
    getIssue
} from '../../actions/Issues'
import {
    PAGE_KEY__ISSUES_PAGE
} from '../../actions/ItemListKeyRegistry'
import {
    get_selected_issue_ids,
    get_selected_sprint_ids
} from '../../actions/Page'
import { ensureSprintsLoaded, getSprint } from '../../actions/Sprints'

class IssuesToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.onNewIssueClick = this.onNewIssueClick.bind(this)
        this.onDashboardClick = this.onDashboardClick.bind(this)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps() {
        this.refresh()
    }

    refresh() {
        const {dispatch, issue_ids, sprint_id} = this.props
        dispatch(ensureIssuesLoaded(issue_ids))
        dispatch(ensureSprintsLoaded([sprint_id]))
    }

    onNewIssueClick() {
        const { dispatch, last_selected_issue_id, sprint_id } = this.props
        dispatch(startCandidateIssue(sprint_id, last_selected_issue_id))
    }

    onDashboardClick() {
        const { project_id, sprint_id } = this.props
        browserHistory.push('/projects/'+project_id+'/sprints/'+sprint_id);
    }

    render() {
        return (
            <div className="toolbar-panel">
              <div className="button toolbar-button--small button--large button--primary" onClick={this.onNewIssueClick}>+ New Issue</div>
              <div className="button toolbar-button--large button--large button--primary" onClick={this.onDashboardClick}>+ Dashboard</div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const selected_issue_ids = get_selected_issue_ids(state, PAGE_KEY__ISSUES_PAGE)
    const issue = (selected_issue_ids && selected_issue_ids.length > 0 && getIssue(state, selected_issue_ids[0])) || {}
    const selected_sprint_ids = get_selected_sprint_ids(state, PAGE_KEY__ISSUES_PAGE)
    const sprint = (selected_sprint_ids && selected_sprint_ids.length > 0 && getSprint(state, selected_sprint_ids[0])) || {}

    return {
        issue_ids: selected_issue_ids,
        issue: issue,
        last_selected_issue_id: issue.id,
        sprint_id: sprint.id,
        project_id: sprint.project_id
    }
}

export default connect(mapStateToProps)(IssuesToolbarPanel)
