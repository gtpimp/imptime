import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { setSprintBreadcrumbsHelper } from '../actions/Breadcrumbs'
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
import { bulkCreateIssues } from '../actions/Issues'
import {
    set_toolbars,
    setPageSelectedEntities
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
        const { project_id, sprint_id, history } = this.props
        history.push('/projects/' + project_id + '/sprints/' + sprint_id)
    }

    onIssuesCreated(new_issue_ids) {
        const { dispatch, history, project_id, sprint_id } = this.props

        dispatch(setPageSelectedEntities(PAGE_KEY__ISSUES_PAGE,
                                 {issue_ids: new_issue_ids,
                                  sprint_ids: [sprint_id],
                                  project_ids: [project_id]}
        ))
        dispatch(selectItems(LIST_KEY__ISSUE_LIST, new_issue_ids))
        history.push('/projects/' + project_id + '/sprints/' + sprint_id + "/issues/")
    }
    
    onSubmitBulkCreate(new_values) {
        const { dispatch, sprint_id } = this.props
        dispatch(bulkCreateIssues(sprint_id, new_values.bulk_issue_text, this.onIssuesCreated))
    }

    refresh(sprint, project) {
        const {dispatch, project_id} = this.props
        if ( sprint.id ) {
            dispatch(setPageSelectedEntities(PAGE_KEY__BULK_CREATE_ISSUES_PAGE, {project_ids: [project_id],
                                                                         sprint_ids: [sprint.id]}))
            dispatch(setSprintBreadcrumbsHelper(project, sprint))
        }
    }

    render() {
        return (
            <div className="bulk-issue-creator-page">
              <BulkIssueCreatorForm onCancel={this.onCancel} onSubmit={this.onSubmitBulkCreate}/>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const sprint_id = props.match.params.sprintId
    const project_id = props.match.params.projectId
    const project = getProject(state, project_id) || {}
    const sprint = getSprint(state, sprint_id) || {}
 
    return {
        sprint_id,
        sprint,
        project_id,
        project
    }
}

export default withRouter(connect(mapStateToProps)(BulkIssueCreatorPage))
