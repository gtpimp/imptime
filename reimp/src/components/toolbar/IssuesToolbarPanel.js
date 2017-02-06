import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../../sass/toolbar-panel.css'
import {
    startCandidateIssue
} from '../../actions/Issue.js'
import {
    PAGE_KEY__ISSUES_PAGE
} from '../../actions/ItemListKeyRegistry'
import {
    get_selected_issue_ids,
    get_selected_sprint_ids
} from '../../actions/Page'
import { ensureIssuesLoaded, getIssue } from '../../actions/Issues'
import { ensureSprintsLoaded, getSprint } from '../../actions/Sprints'

class IssuesToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.onNewIssueClick = this.onNewIssueClick.bind(this)
    }
    
    onNewIssueClick() {
        const { dispatch, last_selected_issue_id, sprint_id } = this.props
        dispatch(startCandidateIssue(sprint_id, last_selected_issue_id))
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

    render() {
        return (
            <div className="toolbar-panel">
                <div className="button button--large button--primary" onClick={this.onNewIssueClick}>+ New Issue</div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const selected_issue_ids = get_selected_issue_ids(state, PAGE_KEY__ISSUES_PAGE)
    const issue = (selected_issue_ids && selected_issue_ids.length > 0 && getIssue(state, selected_issue_ids[0])) || {}
    const selected_sprint_ids = get_selected_sprint_ids(state, PAGE_KEY__ISSUES_PAGE)
    let sprint = (selected_sprint_ids && selected_sprint_ids.length > 0 && getSprint(state, selected_sprint_ids[0])) || {}

    return {
        issue_ids: selected_issue_ids,
        issue: issue,
        last_selected_issue_id: issue.id,
        sprint_id: sprint.id
    }
}


export default connect(mapStateToProps)(IssuesToolbarPanel)
