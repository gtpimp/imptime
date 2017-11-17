import React, {Component} from 'react'
import {connect} from 'react-redux'
import IssueSidebar from '../components/IssueSidebar'
import {browserHistory} from 'react-router'
import NewIssueSidebar from '../components/NewIssueSidebar'
import MultipleIssueSidebar from '../components/MultipleIssueSidebar'
import IssueList from '../components/IssueList'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import { includes, compact } from 'lodash'
import {
    LIST_KEY__ISSUE_LIST,
    PAGE_KEY__ISSUES_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    selectItems,
    update_list_filter,
    invalidateList
} from '../actions/ItemList'
import {
    set_toolbars,
    select_issues,
    get_selected_issue_ids,
    select_sprints,
    get_header_list,
    set_wide_column_mode,
    getPageFlag
} from '../actions/Page'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'
import {getCandidateIssue} from '../actions/Issues'

class IssuesPage extends Component {

    constructor(props) {
        super(props)
        this.onSelectIssues = this.onSelectIssues.bind(this)
    }

    componentDidMount() {
        const {sprint_id, project_id, sprint, project, dispatch} = this.props
        dispatch(set_toolbars(PAGE_KEY__ISSUES_PAGE, ['issues', 'issue']))
        dispatch(update_list_filter(LIST_KEY__ISSUE_LIST, {sprint_id:sprint.id || -1}))
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(set_wide_column_mode(PAGE_KEY__ISSUES_PAGE, false))
        this.refresh(sprint, project)
    }

    componentWillReceiveProps(new_props) {
        const { dispatch} = this.props
        dispatch(ensureProjectsLoaded([new_props.project_id]))
        dispatch(ensureSprintsLoaded([new_props.sprint_id]))

        if ( new_props.sprint.id !== this.props.sprint.id ||
             new_props.sprint.name !== this.props.sprint.name ||
             new_props.project.name !== this.props.project.name) {
            dispatch(select_issues(PAGE_KEY__ISSUES_PAGE, []))
            this.refresh(new_props.sprint, new_props.project)
        }
    }

    refresh(sprint, project) {
        const {dispatch, selected_issue_ids, default_issue_id} = this.props
        if ( sprint.id ) {
            dispatch(update_list_filter(LIST_KEY__ISSUE_LIST, {sprint_id:sprint.id}))
            dispatch(select_sprints(PAGE_KEY__ISSUES_PAGE, [sprint.id]))
            dispatch(invalidateList(LIST_KEY__ISSUE_LIST))

            if ( default_issue_id != undefined && !includes(selected_issue_ids, default_issue_id) ) {
                dispatch(selectItems(LIST_KEY__ISSUE_LIST, [default_issue_id]))
                dispatch(select_issues(PAGE_KEY__ISSUES_PAGE, [default_issue_id]))
            }

            dispatch(setBreadcrumbs([ {to: '/projects', label: 'Projects'},
                                      {to: '/projects/'+project.id, label: project.name},
                                      {to: '/projects/'+project.id+'/sprints', label: 'Sprints'},
                                      {to: '/projects/'+project.id+'/sprints/'+sprint.id, label: sprint.name},
                                      {to: '/projects/'+project.id+'/sprints/'+sprint.id+'/issues', label: 'Issues'}]))
        }
    }

    onSelectIssues(issue_ids) {
        const { dispatch, project_id, sprint_id } = this.props
        dispatch(selectItems(LIST_KEY__ISSUE_LIST, issue_ids))
        dispatch(select_issues(PAGE_KEY__ISSUES_PAGE, issue_ids))

        if ( issue_ids && issue_ids.length === 1 ) {
            browserHistory.push('/projects/'+project_id+'/sprints/'+sprint_id+'/issues/'+issue_ids[0]);
        }
    }

    render() {

        const { sprint_id, project_id, selected_issues, selected_issue_ids,
                is_single_selection, is_multiple_selection, is_creating_issue,
                issue_header_list, show_sidebar
        } = this.props

        const selected_issue = ( selected_issues && selected_issues.length > 0 && selected_issues[0] ) || null

        return (
            <div className="list-layout">
              <div className="list-layout__list">
                <IssueList list_key={LIST_KEY__ISSUE_LIST}
                           onSelectIssues={this.onSelectIssues}
                           issue_header_list={issue_header_list}
                />
              </div>
              { is_creating_issue && 
                <div className="list-layout__sidebar">
                  <NewIssueSidebar onCreatedIssues={this.onSelectIssues} />
                </div>
              }
              { ! is_creating_issue && is_single_selection && sprint_id && selected_issue && show_sidebar &&
                <div className="list-layout__sidebar">
                  <IssueSidebar issue_id={selected_issue.id} sprint_id={sprint_id} project_id={project_id}/>
                </div>
              }
              { ! is_creating_issue && is_multiple_selection && sprint_id && selected_issue_ids && show_sidebar &&
                <div className="list-layout__sidebar">
                  <MultipleIssueSidebar issue_ids={selected_issue_ids} sprint_id={sprint_id} project_id={project_id}/>
                </div>
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const {issue} = state
    const items_by_id = (issue && issue.items_by_id) || {}
    const selected_issue_ids = get_selected_issue_ids(state, PAGE_KEY__ISSUES_PAGE)
    const selected_items = items_by_id && selected_issue_ids && selected_issue_ids.map( function(selected_id, index) {
	return items_by_id[selected_id] || { 'id': selected_id,
					     'loaded': false }
    })

    const sprint_id = props.params.sprintId
    const project_id = props.params.projectId
    const default_issue_id = props.params.issueId
    const project = getProject(state, project_id) || {}
    const sprint = getSprint(state, sprint_id) || {}
    const candidate_issue = getCandidateIssue(state) || null
    const is_creating_issue = candidate_issue || false
    const issue_header_list = get_header_list(state, PAGE_KEY__ISSUES_PAGE)
    const show_sidebar = getPageFlag(state, PAGE_KEY__ISSUES_PAGE, "show_sidebar") || false

    return {
        sprint_id: sprint_id,
        sprint: sprint,
        project_id: project_id,
        project: project,
        default_issue_id,
        selected_issues: selected_items,
        selected_issue_ids: selected_issue_ids,
        is_single_selection: selected_items.length === 1,
        is_multiple_selection: compact(selected_items).length > 1,
        is_creating_issue: is_creating_issue,
        issue_header_list: issue_header_list,
        show_sidebar
    }
}

export default connect(mapStateToProps)(IssuesPage)
