import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'
import {
    PAGE_KEY__BULK_CREATE_ISSUES_PAGE,
    PAGE_KEY__ISSUES_PAGE,
    LIST_KEY__ISSUE_LIST
} from '../actions/ItemListKeyRegistry.js'
import {
    selectItems,
} from '../actions/ItemList'
import BulkIssueCreatorForm from '../components/form/BulkIssueCreatorForm.js'
import { bulkCreateIssues, isBulkCreatingIssues } from '../actions/Issues'
import {
    set_toolbars,
    select_sprints,
    select_issues
} from '../actions/Page'

class BulkIssueCreatorPage extends Component {

    constructor(props) {
        super(props)
        this.onSubmitBulkCreate = this.onSubmitBulkCreate.bind(this)
        this.onCancel = this.onCancel.bind(this)
        this.onIssuesCreated = this.onIssuesCreated.bind(this)
    }

    componentDidMount() {
        const {sprint_id, project_id, sprint, project, dispatch} = this.props
        dispatch(set_toolbars(PAGE_KEY__BULK_CREATE_ISSUES_PAGE, ['bulk-issue-creator']))
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        this.refresh(sprint, project)
    }

    componentWillReceiveProps(new_props) {
        const { dispatch} = this.props
        dispatch(ensureProjectsLoaded([new_props.project_id]))
        dispatch(ensureSprintsLoaded([new_props.sprint_id]))

        if ( new_props.sprint.id !== this.props.sprint.id ||
             new_props.sprint.name !== this.props.sprint.name ||
             new_props.project.name !== this.props.project.name) {
            this.refresh(new_props.sprint, new_props.project)
        }
    }

    onCancel() {
        const { project_id, sprint_id } = this.props
        browserHistory.push('/projects/' + project_id + '/sprints/' + sprint_id)
    }

    onIssuesCreated(new_issue_ids) {
        const { dispatch, project_id, sprint_id } = this.props
        dispatch(select_issues(PAGE_KEY__ISSUES_PAGE, new_issue_ids))
        dispatch(selectItems(LIST_KEY__ISSUE_LIST, new_issue_ids))
        browserHistory.push('/projects/' + project_id + '/sprints/' + sprint_id + "/issues/")
    }
    
    onSubmitBulkCreate(new_values) {
        const { dispatch, sprint_id } = this.props
        dispatch(bulkCreateIssues(sprint_id, new_values.bulk_issue_text, this.onIssuesCreated))
    }

    refresh(sprint, project) {
        const {dispatch} = this.props
        if ( sprint.id ) {
            dispatch(select_sprints(PAGE_KEY__BULK_CREATE_ISSUES_PAGE, [sprint.id]))

            if ( sprint.sprint_type === 'sprint' ) {
                dispatch(setBreadcrumbs([ {to: '/projects', label: 'Projects'},
                                          {to: '/projects/'+project.id, label: project.name},
                                          {to: '/projects/'+project.id+'/sprints', label: 'Sprints'},
                                          {to: '/projects/'+project.id+'/sprints/'+sprint.id, label: sprint.name},
                                          {to: '/projects/'+project.id+'/sprints/'+sprint.id+'/bulkCreateIssues', label: 'Bulk Create'}]))
            } else if ( sprint.sprint_type === 'template' ) {
                dispatch(setBreadcrumbs([ {to: '/projects', label: 'Projects'},
                                          {to: '/projects/'+project.id, label: project.name},
                                          {to: '/projects/'+project.id+'/sprintTemplates', label: 'Templates'},
                                          {to: '/projects/'+project.id+'/sprintTemplates/'+sprint.id, label: sprint.name},
                                          {to: '/projects/'+project.id+'/sprintTemplates/'+sprint.id+'/issues', label: 'Bulk Create'}]))
            }

        }
    }

    render() {
        const { is_bulk_creating_issues } = this.props
        return (
            <div className="bulk-issue-creator-page">
              { is_bulk_creating_issues && <div>Saving...</div> }
              { ! is_bulk_creating_issues && 
                <BulkIssueCreatorForm onCancel={this.onCancel} onSubmit={this.onSubmitBulkCreate}/>
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const sprint_id = props.params.sprintId
    const project_id = props.params.projectId
    const project = getProject(state, project_id) || {}
    const sprint = getSprint(state, sprint_id) || {}
    const is_bulk_creating_issues = isBulkCreatingIssues(state, sprint_id)
 
    return {
        sprint_id,
        sprint,
        project_id,
        project,
        is_bulk_creating_issues
    }
}

export default connect(mapStateToProps)(BulkIssueCreatorPage)
