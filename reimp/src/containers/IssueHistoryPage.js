import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import IssueHistoryList from '../components/IssueHistoryList'
import {setIssueBreadcrumbsHelper} from '../actions/Breadcrumbs'
import {
    LIST_KEY__ISSUE_HISTORY_LIST,
    PAGE_KEY__ISSUE_HISTORY_PAGE,
    ISSUE_HISTORY_HEADER_LIST
} from '../actions/ItemListKeyRegistry'
import {
    update_list_filter,
    update_list_pagination,
} from '../actions/ItemList'
import {
    set_toolbars,
} from '../actions/Page'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'
import {ensureIssuesLoaded, getIssue} from '../actions/Issues'

class IssueHistoryPage extends Component {

    componentDidMount() {
        const {issue_id, dispatch, list_key} = this.props
        dispatch(set_toolbars(PAGE_KEY__ISSUE_HISTORY_PAGE, []))
        dispatch(update_list_filter(list_key, {issue_id: issue_id}))
        dispatch(update_list_pagination(list_key, {page_size: 50}))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, issue, sprint, project } = props
        if ( props.issue_id && (!props.issue || props.issue.id !== props.issue_id) ) {
            dispatch(ensureIssuesLoaded([props.issue_id]))
        }
        if ( props.sprint_id && (!props.sprint || props.sprint.id !== props.sprint_id) ) {
            dispatch(ensureSprintsLoaded([props.sprint_id]))
        }
        if ( props.project_id && (!props.project || props.project.id !== props.project_id) ) {
            dispatch(ensureProjectsLoaded([props.project_id]))
        }
        if ( project && sprint && issue &&
             (!this.props.project || !this.props.sprint || !this.props.issue ||
               this.props.issue_id !== props.issue_id ||
               this.props.sprint_id !== props.sprint_id ||
               this.props.project_id !== props.project_id) ) {
            dispatch(setIssueBreadcrumbsHelper(project, sprint, issue))
        }
    }

    render() {
        const { issue_history_header_list, list_key} = this.props
        return (
            <div className="list-layout__list">
              <IssueHistoryList list_key={list_key}
                                header_list={issue_history_header_list} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const issue_id = props.match.params.issueId
    const issue_history_header_list = ISSUE_HISTORY_HEADER_LIST
    const issue = getIssue(state, issue_id)
    const sprint = issue && getSprint(state, issue.sprint_id)
    const project = issue && getProject(state, issue.project_id)
    
    return {
        issue_history_header_list,
        issue_id,
        issue,
        sprint,
        sprint_id: issue && issue.sprint_id,
        project,
        project_id: issue && issue.project_id,
        list_key: LIST_KEY__ISSUE_HISTORY_LIST,
    }
}

export default withRouter(connect(mapStateToProps)(IssueHistoryPage))
