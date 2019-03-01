import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import '../../sass/toolbar-panel.css'
import '../../sass/icon.css'
import {
    startCandidateIssue,
    ensureIssuesLoaded,
    getIssue,
    saveCandidateIssue,
    updateCandidateSubject,
    updateCandidateSprint
} from '../../actions/Issues'

import {
    PAGE_KEY__ISSUES_PAGE,
    LIST_KEY__ISSUE_LIST
} from '../../actions/ItemListKeyRegistry'
import {
    getPageSelectedEntities
} from '../../actions/Page'
import { ensureSprintsLoaded, getSprint } from '../../actions/Sprints'
import ModalDialog from '../ModalDialog'
import EditableIssueStateFilter from '../EditableIssueStateFilter'
import PopupPanelButton from '../PopupPanelButton'
import IconButton from '../IconButton'
import add_icon from '../../images/icon_add.svg'
import filter_icon from '../../images/icon_filter.svg'
import NewIssueForm from '../form/NewIssueForm'

class IssuesToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.onNewIssueClick = this.onNewIssueClick.bind(this)
        this.startEditingFilter = this.startEditingFilter.bind(this)
        this.stopEditingFilter = this.stopEditingFilter.bind(this)
        this.state = { editing_filter: false,
                       creating_issue: false }
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
        this.setState({creating_issue:true})
    }

    onStopCreateIssue = () => {
        this.setState({creating_issue:false})
    }

    onCreateIssue = (new_values) => {
        const {dispatch, history, project_id, sprint_id, last_selected_issue_id} = this.props
        dispatch(startCandidateIssue(sprint_id, last_selected_issue_id))
        dispatch(updateCandidateSubject(new_values.issue_title))
        dispatch(updateCandidateSprint(sprint_id))
        const onDone = (issue_id) => {
            this.onStopCreateIssue()
            history.push('/projects/'+project_id+'/sprints/'+sprint_id+'/issues/'+issue_id)
        }
        dispatch(saveCandidateIssue(onDone))
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
                         title={"Filter issue list"}
                         variant="medium">

              <EditableIssueStateFilter list_key={LIST_KEY__ISSUE_LIST}
                                        project_id={project_id} />

              <PopupPanelButton onClick={this.stopEditingFilter}>Close</PopupPanelButton>
              
            </ModalDialog>
        )
    }

    renderCreatingIssue() {
        return (
            <ModalDialog isOpen={true}
                         onClose={this.onStopCreateIssue}
                         title="New Issue"
                         variant="large"
            >
              <NewIssueForm onSubmitted={this.onCreateIssue}
                            onStopCreateIssue={this.onStopCreateIssue} />
            </ModalDialog>
        )
    }
    
    render() {

        const { creating_issue, editing_filter } = this.state
        
        return (
            <div className="toolbar_container">
              <IconButton
                  icon={ add_icon }
                  label="New&nbsp;issue"
                  onButtonClick={this.onNewIssueClick}/>

              <IconButton
                  icon={ filter_icon }
                  label="Filter"
                  onButtonClick={this.startEditingFilter}/>

              { editing_filter && this.renderEditingFilter() }

              { creating_issue && this.renderCreatingIssue() }
              
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const selected_issue_ids = getPageSelectedEntities(state, PAGE_KEY__ISSUES_PAGE).issue_ids
    const issue = (selected_issue_ids && selected_issue_ids.length > 0 && getIssue(state, selected_issue_ids[selected_issue_ids.length-1])) || {}
    const selected_sprint_ids = getPageSelectedEntities(state, PAGE_KEY__ISSUES_PAGE).sprint_ids
    const sprint = (selected_sprint_ids && selected_sprint_ids.length > 0 && getSprint(state, selected_sprint_ids[selected_sprint_ids.length-1])) || {}

    return {
        issue_ids: selected_issue_ids,
        selected_issue_ids,
        last_selected_issue_id: issue.id,
        sprint_id: sprint.id || null,
        project_id: sprint.project_id,
    }
}

export default withRouter(connect(mapStateToProps)(IssuesToolbarPanel))
