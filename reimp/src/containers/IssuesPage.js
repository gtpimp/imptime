import React, {Component} from 'react'
import {connect} from 'react-redux'
import IssueSidebar from '../components/IssueSidebar'
import {withRouter} from 'react-router-dom'
import NewIssueSidebar from '../components/NewIssueSidebar'
import MultipleIssueSidebar from '../components/MultipleIssueSidebar'
import IssueList from '../components/IssueList'
import { getHeaderHeight, getFooterHeight, getToolbarHeight } from '../actions/Header'
import {setIssueBreadcrumbsHelper} from '../actions/Breadcrumbs'
import { includes, compact } from 'lodash'
import SplitPane from 'react-split-pane'
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
    setPageFlag
} from '../actions/Page'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'
import {getCandidateIssue, getIssues} from '../actions/Issues'
import { getIssueHeaderListForCurrentMien } from '../actions/Mien'

class IssuesPage extends Component {

    constructor(props) {
        super(props)
        this.onSelectIssues = this.onSelectIssues.bind(this)
        this.onChangeSplitterSize = this.onChangeSplitterSize.bind(this)
        this.onSetSidebarViewMode = this.onSetSidebarViewMode.bind(this)
    }

    componentDidMount() {
        const {sprint_id, project_id, sprint, dispatch} = this.props
        dispatch(set_toolbars(PAGE_KEY__ISSUES_PAGE, ['issues', 'issue']))
        dispatch(update_list_filter(LIST_KEY__ISSUE_LIST, {sprint_id:sprint.id || -1}))
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(select_sprints(PAGE_KEY__ISSUES_PAGE, [sprint_id]))
        dispatch(select_projects(PAGE_KEY__ISSUES_PAGE, [project_id]))

        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, default_issue_id } = new_props
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
            dispatch(setIssueBreadcrumbsHelper(project, sprint, selected_issue))
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

    onChangeSplitterSize(size) {
        const { dispatch } = this.props
        dispatch(setPageFlag(PAGE_KEY__ISSUES_PAGE, 'splitter_size', size))
    }

    onSetSidebarViewMode(view_mode) {
        const { dispatch } = this.props
        dispatch(setPageFlag(PAGE_KEY__ISSUES_PAGE, 'sidebar_view_mode', view_mode))
    }

    renderLeftPane() {
        const { issue_header_list, sprint_id, filter_sprint_id, header_height, footer_height, toolbar_height } = this.props
        const height_limit = "calc(100vh - " + (header_height + footer_height + toolbar_height + 1) +"px)"
        const styles = {maxHeight: height_limit}
        
        return (
              <div className="list-layout__list" style={styles}>
                { filter_sprint_id === sprint_id &&
                  <IssueList list_key={LIST_KEY__ISSUE_LIST}
                             onSelectIssues={this.onSelectIssues}
                             issue_header_list={issue_header_list}
                  />
                }
              </div>
        )
    }

    renderRightPane() {
        const { sprint_id, project_id, selected_issue_ids, sidebar_view_mode,
                is_single_selection, is_multiple_selection, is_creating_issue, selected_issue
        } = this.props

        if ( is_creating_issue ) {
            return (
                <div className="list-layout__sidebar">
                  <NewIssueSidebar onCreatedIssues={this.onSelectIssues} project_id={project_id} sprint_id={sprint_id} />
                </div>
            )
        } else if ( is_single_selection && sprint_id && selected_issue ) {
            return (
                <div className="list-layout__sidebar">
                  <IssueSidebar issue_id={selected_issue.id}
                                sprint_id={sprint_id}
                                project_id={project_id}
                                setSidebarViewMode={this.onSetSidebarViewMode}
                                sidebar_view_mode={sidebar_view_mode}
                  />
                </div>
            )
        } else if ( is_multiple_selection && sprint_id && selected_issue_ids ) {
            return (
                <div className="list-layout__sidebar">
                  <MultipleIssueSidebar issue_ids={selected_issue_ids} sprint_id={sprint_id} project_id={project_id}/>
                </div>
            )
        }
    }

    render() {

        const { show_sidebar, splitter_size, header_height,
                toolbar_height, footer_height } = this.props
        const height_limit = "calc(100vh - " + (header_height + footer_height + toolbar_height + 1) +"px)"
        if ( show_sidebar ) {
            const styles={maxHeight: height_limit}
            return (
                <div className="list-layout">
                  <SplitPane split="vertical" minSize={50}
                             defaultSize={splitter_size}
                             onChange={this.onChangeSplitterSize}
                             style={styles}
                  >
                    <div className="left">
                      {this.renderLeftPane()}
                    </div>
                    <div className="right">
                      {this.renderRightPane()}
                    </div>
                  </SplitPane>
                </div>
            )
        }
        if ( ! show_sidebar ) {
            return (
                <div className="list-layout">
                  {this.renderLeftPane()}
                </div>
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
    const issue_header_list = getIssueHeaderListForCurrentMien(state)
    const show_sidebar = getPageFlag(state, PAGE_KEY__ISSUES_PAGE, "show_sidebar", true)
    const sidebar_view_mode = getPageFlag(state, PAGE_KEY__ISSUES_PAGE, "sidebar_view_mode", "right")
    const selected_issue = ( selected_items && selected_items.length > 0 && selected_items[0] ) || null
    const splitter_size = getPageFlag(state, PAGE_KEY__ISSUES_PAGE, 'splitter_size', "80%")
    const header_height = getHeaderHeight(state)
    const footer_height = getFooterHeight(state)
    const toolbar_height = getToolbarHeight(state)

    return {
        filter_sprint_id,
        sprint_id: sprint_id,
        sprint: sprint,
        project_id: project_id,
        project: project,
        default_issue_id,
        splitter_size,
        selected_issue: selected_issue || {},
        selected_issue_ids: selected_issue_ids,
        is_single_selection: selected_items.length === 1,
        is_multiple_selection: compact(selected_items).length > 1,
        is_creating_issue: is_creating_issue,
        issue_header_list: issue_header_list,
        show_sidebar: (selected_issue && show_sidebar) || is_creating_issue,
        sidebar_view_mode,
        header_height,
        footer_height,
        toolbar_height,
    }
}

export default withRouter(connect(mapStateToProps)(IssuesPage))
