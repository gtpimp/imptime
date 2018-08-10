import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import AutoClockList from '../components/auto_clock/AutoClockList'
import {setIssueBreadcrumbsHelper} from '../actions/Breadcrumbs'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'
import {ensureIssuesLoaded, getIssue} from '../actions/Issues'
import {set_toolbars,} from '../actions/Page'
import IssueName from '../components/IssueName'
import {
    LIST_KEY__CLOCK_HISTORY_LIST,
    PAGE_KEY__CLOCK_HISTORY_PAGE
} from '../actions/ItemListKeyRegistry'
import { initList, update_list_filter } from '../actions/ItemList'
import { logged_in_user } from '../actions/Auth'

import Splitter from '../components/Splitter'

class ClockHistoryPage extends Component {

    componentDidMount() {
        const { dispatch, list_key, logged_in_user_id, filter_unallocated, filter_issue_id } = this.props
        dispatch(set_toolbars(PAGE_KEY__CLOCK_HISTORY_PAGE, ['clock-history']))
	dispatch(initList(list_key))
        if ( logged_in_user_id ) {
            dispatch(update_list_filter(list_key, {user_id:logged_in_user_id}))
        }
        if ( filter_unallocated ) {
            dispatch(update_list_filter(list_key, {is_unallocated:filter_unallocated}))
        }
        if ( filter_issue_id ) {
            dispatch(update_list_filter(list_key, {issue_id:filter_issue_id}))
        }
        
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
        const { list_key, filter_unallocated, filter_issue_id } = this.props
        return (
            <div className="list-layout__list">
              <Splitter>
                <div>
                  { filter_unallocated &&
                    <h2>
                      Unallocated time entries.
                    </h2>
                  }
                  { filter_issue_id &&
                    <h2>
                      For issue <IssueName issue_id={filter_issue_id} />
                    </h2>
                  }
                  <AutoClockList list_key={list_key} />
                    
                </div>
                {null}
              </Splitter>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { filter } = props.match.params
    const { issueId } = props.match.params

    const filter_unallocated = filter === "unallocated"
    const filter_issue_id = issueId || undefined

    const issue = filter_issue_id && getIssue(state, filter_issue_id)
    const sprint = issue && getSprint(state, issue.sprint_id)
    const project = issue && getProject(state, issue.project_id)
    const logged_in_user_id = logged_in_user().user_id
    
    return {
        list_key: LIST_KEY__CLOCK_HISTORY_LIST,
        filter_unallocated,
        filter_issue_id,
        issue,
        sprint,
        project,
        issue_id: filter_issue_id,
        sprint_id: issue && issue.sprint_id,
        project_id: issue && issue.project_id,
        logged_in_user_id
    }
}

export default withRouter(connect(mapStateToProps)(ClockHistoryPage))
