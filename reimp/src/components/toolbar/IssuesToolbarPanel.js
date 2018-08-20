import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../../sass/toolbar-panel.css'
import '../../sass/icon.css'
import {
    startCandidateIssue,
    ensureIssuesLoaded,
    getIssue
} from '../../actions/Issues'
import {
    PAGE_KEY__ISSUES_PAGE,
    LIST_KEY__ISSUE_LIST
} from '../../actions/ItemListKeyRegistry'
import {
    get_selected_issue_ids,
    get_selected_sprint_ids
} from '../../actions/Page'
import { ensureSprintsLoaded, getSprint } from '../../actions/Sprints'
import ModalDialog from '../ModalDialog'
import EditableIssueStateFilter from '../EditableIssueStateFilter'

class IssuesToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.onNewIssueClick = this.onNewIssueClick.bind(this)
        this.startEditingFilter = this.startEditingFilter.bind(this)
        this.stopEditingFilter = this.stopEditingFilter.bind(this)
        this.state = { 'editing_filter': false }
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
        const { dispatch, last_selected_issue_id, sprint_id, selected_issue_ids } = this.props
        dispatch(startCandidateIssue(sprint_id, last_selected_issue_id, selected_issue_ids))
    }

    startEditingFilter() {
        this.setState({'editing_filter': true})
    }

    stopEditingFilter() {
        this.setState({'editing_filter': false})
    }

    renderEditingFilter() {
        const { project_id } = this.props
        return (
            <ModalDialog isOpen={true}
                         onClose={this.stopEditingFilter}
                         title={"Filter issue list by status"}
                         variant="medium">

              <EditableIssueStateFilter list_key={LIST_KEY__ISSUE_LIST}
                                        project_id={project_id} />
              
            </ModalDialog>
        )
    }
    
    render() {

        const { editing_filter } = this.state
        
        return (
            <div className="toolbar-panel">
              <div className="button toolbar-button--small button--large button--primary"
                   onClick={this.onNewIssueClick}>
                + New Issue
              </div>
              <div className="button toolbar-button--small button--large button--primary"
                   onClick={this.startEditingFilter}>
                Filter
              </div>
              { editing_filter && this.renderEditingFilter() }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const selected_issue_ids = get_selected_issue_ids(state, PAGE_KEY__ISSUES_PAGE)
    const issue = (selected_issue_ids && selected_issue_ids.length > 0 && getIssue(state, selected_issue_ids[selected_issue_ids.length-1])) || {}
    const selected_sprint_ids = get_selected_sprint_ids(state, PAGE_KEY__ISSUES_PAGE)
    const sprint = (selected_sprint_ids && selected_sprint_ids.length > 0 && getSprint(state, selected_sprint_ids[selected_sprint_ids.length-1])) || {}

    return {
        issue_ids: selected_issue_ids,
        selected_issue_ids,
        last_selected_issue_id: issue.id,
        sprint_id: sprint.id || null,
        project_id: sprint.project_id,
    }
}

export default connect(mapStateToProps)(IssuesToolbarPanel)
