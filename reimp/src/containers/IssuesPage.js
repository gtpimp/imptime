import React, {Component} from 'react'
import {connect} from 'react-redux'
import IssueSidebar from '../components/IssueSidebar'
import {withRouter} from 'react-router-dom'
import NewIssueSidebar from '../components/NewIssueSidebar'
import MultipleIssueSidebar from '../components/MultipleIssueSidebar'
import IssueList from '../components/IssueList'
import {setIssueBreadcrumbsHelper} from '../actions/Breadcrumbs'
import { includes, compact } from 'lodash'
import Splitter from '../components/Splitter'
import {
    LIST_KEY__ISSUE_LIST,
    PAGE_KEY__ISSUES_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    selectItems,
    update_list_filter,
    getListFilter,
    invalidateList,
} from '../actions/ItemList'
import {
    set_toolbars,
    select_issues,
    get_selected_issue_ids,
    select_sprints,
    select_projects,
    getPageFlag,
    setPageFlag,
    setBrowserTitle
} from '../actions/Page'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'
import {getCandidateIssue, getIssues} from '../actions/Issues'

class IssuesPage extends Component {

    constructor(props) {
        super(props)
        this.onSelectIssues = this.onSelectIssues.bind(this)
        this.onSetSidebarViewMode = this.onSetSidebarViewMode.bind(this)
        this.state = {}
    }

    componentDidMount() {
        const {sprint_id, project_id, sprint, dispatch} = this.props
        dispatch(set_toolbars(PAGE_KEY__ISSUES_PAGE, ['issues', 'issue'], "Issue list"))
        dispatch(update_list_filter(LIST_KEY__ISSUE_LIST, {sprint_id:sprint.id || -1}))
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(select_sprints(PAGE_KEY__ISSUES_PAGE, [sprint_id]))
        dispatch(select_projects(PAGE_KEY__ISSUES_PAGE, [project_id]))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, project, sprint, default_issue_id, selected_issue } = new_props
        dispatch(ensureProjectsLoaded([new_props.project_id]))
        dispatch(ensureSprintsLoaded([new_props.sprint_id]))

        if ( new_props.sprint.id !== this.props.sprint.id ||
             new_props.sprint.name !== this.props.sprint.name ||
             new_props.project.name !== this.props.project.name ) {

            if ( new_props.sprint_id !== this.props.sprint_id ) {
                dispatch(select_issues(PAGE_KEY__ISSUES_PAGE, []))
                dispatch(select_sprints(PAGE_KEY__ISSUES_PAGE, [new_props.sprint_id]))
                dispatch(select_projects(PAGE_KEY__ISSUES_PAGE, [new_props.project_id]))
                dispatch(invalidateList(LIST_KEY__ISSUE_LIST))
            }
            this.refresh(new_props)
        } else {
            if ( this.state && this.state.noticed_default_issue_id !== default_issue_id ) {
                this.selectDefaultIssue(new_props)
            }
        }
        if ( (selected_issue && selected_issue.loaded !== false && this.state.breadcrumb_issue_id !== selected_issue.id) &&
             ( (project && new_props.project.id !== this.props.project.id) ||
               (sprint && new_props.sprint.id !== this.props.sprint.id) ||
               (selected_issue && new_props.selected_issue.id !== this.props.selected_issue.id) ||
               (selected_issue && selected_issue.loaded !== false && this.state.breadcrumb_issue_id !== selected_issue.id) ) ) {
            dispatch(setIssueBreadcrumbsHelper(project, sprint, selected_issue))
            this.setState({'breadcrumb_issue_id': selected_issue.id})
        }
    }

    refresh(these_props) {
        const {dispatch, sprint, filter_sprint_id,
               project, default_issue_id, selected_issue} = these_props || this.props

        if ( sprint.id !== filter_sprint_id ) {
            dispatch(update_list_filter(LIST_KEY__ISSUE_LIST, {sprint_id:sprint.id}))
            dispatch(select_sprints(PAGE_KEY__ISSUES_PAGE, [sprint.id]))
            dispatch(invalidateList(LIST_KEY__ISSUE_LIST))
        }
        
        if ( sprint.id ) {
            this.selectDefaultIssue(this.props)
            if ( selected_issue && selected_issue.loaded !== false ) {
                dispatch(setIssueBreadcrumbsHelper(project, sprint, selected_issue))
                this.setState({'breadcrumb_issue_id': selected_issue.id})
            }
        }
        this.setState({'noticed_default_issue_id': default_issue_id})
    }

    selectDefaultIssue(these_props) {
        const {dispatch, selected_issue_ids,
               default_issue_id} = these_props || this.props
        if ( default_issue_id !== undefined && !includes(selected_issue_ids, default_issue_id) ) {
            dispatch(selectItems(LIST_KEY__ISSUE_LIST, [default_issue_id]))
            dispatch(select_issues(PAGE_KEY__ISSUES_PAGE, [default_issue_id]))
        }
        this.setState({'noticed_default_issue_id': default_issue_id})
    }

    onSelectIssues(issue_ids) {
        const { dispatch, history, project_id, sprint_id } = this.props
        dispatch(selectItems(LIST_KEY__ISSUE_LIST, issue_ids))
        dispatch(select_projects(PAGE_KEY__ISSUES_PAGE, [project_id]))
        dispatch(select_sprints(PAGE_KEY__ISSUES_PAGE, [sprint_id]))
        dispatch(select_issues(PAGE_KEY__ISSUES_PAGE, issue_ids))

        if ( issue_ids && issue_ids.length === 1 ) {
            history.push('/projects/'+project_id+'/sprints/'+sprint_id+'/issues/'+issue_ids[0]);
        }
    }

    onSetSidebarViewMode(view_mode) {
        const { dispatch } = this.props
        dispatch(setPageFlag(PAGE_KEY__ISSUES_PAGE, 'sidebar_view_mode', view_mode))
    }

    renderLeftPane() {
        const { sprint_id, filter_sprint_id } = this.props
        if ( filter_sprint_id !== sprint_id ) {
            return null
        }
        return (
            <IssueList list_key={LIST_KEY__ISSUE_LIST}
                       onSelectIssues={this.onSelectIssues}
            />
        )

    }

    renderRightPane() {
        const { sprint_id, project_id, selected_issue_ids, sidebar_view_mode,
                is_single_selection, is_multiple_selection, is_creating_issue, selected_issue
        } = this.props

        if ( is_creating_issue ) {
            return (
                <NewIssueSidebar onCreatedIssues={this.onSelectIssues}
                                 project_id={project_id}
                                 sprint_id={sprint_id} />
            )
        } else if ( is_single_selection && sprint_id && selected_issue ) {
            return (
                <IssueSidebar issue_id={selected_issue.id}
                              sprint_id={sprint_id}
                              project_id={project_id}
                              setSidebarViewMode={this.onSetSidebarViewMode}
                              sidebar_view_mode={sidebar_view_mode}
                />
            )
        } else if ( is_multiple_selection && sprint_id && selected_issue_ids ) {
            return (
                <MultipleIssueSidebar issue_ids={selected_issue_ids} sprint_id={sprint_id} project_id={project_id}/>
            )
        }
    }

    render() {

        const { show_sidebar, sidebar_view_mode, project } = this.props

        setBrowserTitle(project.name)


        if ( sidebar_view_mode === 'fullscreen' ) {
            if ( show_sidebar ) {
                return (
                    <Splitter>
                      { this.renderRightPane() }
                      {null}
                    </Splitter>
                )
            } else {
                return (
                    <Splitter>
                      { this.renderLeftPane() }
                      {null}
                    </Splitter>
                )
            }
        } else {
            return (
                <Splitter name="issues_page">
                  {this.renderLeftPane()}
                  { (show_sidebar && this.renderRightPane()) || null }
                </Splitter>
            )
        }
    }
}

function mapStateToProps(state, props) {

    const selected_issue_ids = get_selected_issue_ids(state, PAGE_KEY__ISSUES_PAGE)
    const selected_items = getIssues(state, selected_issue_ids)

    const filter_sprint_id = (getListFilter(state, LIST_KEY__ISSUE_LIST) || {}).sprint_id
    const sprint_id = props.match.params.sprintId
    const project_id = props.match.params.projectId
    const default_issue_id = props.match.params.issueId
    const project = getProject(state, project_id) || {}
    const sprint = getSprint(state, sprint_id) || {}
    const candidate_issue = getCandidateIssue(state) || null
    const is_creating_issue = candidate_issue || false
    const show_sidebar = getPageFlag(state, PAGE_KEY__ISSUES_PAGE, "show_sidebar", true)
    const sidebar_view_mode = getPageFlag(state, PAGE_KEY__ISSUES_PAGE, "sidebar_view_mode", "right")
    const selected_issue = ( selected_items && selected_items.length > 0 && selected_items[0] ) || null

    return {
        filter_sprint_id,
        sprint_id: sprint_id,
        sprint: sprint,
        project_id: project_id,
        project: project,
        default_issue_id,
        selected_issue: selected_issue || {},
        selected_issue_ids: selected_issue_ids,
        is_single_selection: selected_items.length === 1,
        is_multiple_selection: compact(selected_items).length > 1,
        is_creating_issue,
        show_sidebar: (selected_issue && show_sidebar) || is_creating_issue,
        sidebar_view_mode
    }
}

export default withRouter(connect(mapStateToProps)(IssuesPage))
