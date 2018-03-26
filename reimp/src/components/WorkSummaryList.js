import React, { Component } from 'react'
import map from 'lodash/map'
import union from 'lodash/union'
import includes from 'lodash/includes'
import difference from 'lodash/difference'
import { connect } from 'react-redux'
import {
    initList,
    update_list_pagination,
    invalidateList,
    getVisibleItemIds,
    getVisibleItems,
    isLoading,
    getLastUpdated,
    getLoadingItemIds,
    haveItemsBeenRetrieved
} from '../actions/ItemList'
import {
    invalidateAllSummaries,
    fetchSummariesIfNeeded,
    getAllSprintIds,
    getAllUserIds,
    getAllProjectIds,
    getAllIssueIds,
} from '../actions/WorkSummary'
import {ensureUsersLoaded} from '../actions/Users'
import {ensureProjectsLoaded} from '../actions/Projects'
import {ensureSprintsLoaded, getSprints} from '../actions/Sprints'
import {ensureIssuesLoaded} from '../actions/Issues'
import WorkSummary from './WorkSummary'
import '../sass/project-summary-list.scss'
import {
    ENTITY_KEY__WORK_SUMMARY,
    ENTITY_KEY__SPRINT,
    ENTITY_KEY__PROJECT,
    ENTITY_KEY__USER,
    ENTITY_KEY__ISSUE,
} from '../actions/ItemListKeyRegistry'
import Pagination from './Pagination'

class WorkSummaryList extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
	this.onChangePage = this.onChangePage.bind(this)
    }

    componentDidMount() {
	const { dispatch, list_key, all_user_ids, all_sprint_ids, all_project_ids, all_issue_ids } = this.props
	dispatch(initList(list_key))
        dispatch(update_list_pagination(list_key, { page_size: 1 }))
        dispatch(ensureUsersLoaded(all_user_ids))
        dispatch(ensureSprintsLoaded(all_sprint_ids))
        dispatch(ensureProjectsLoaded(all_project_ids))
        dispatch(ensureIssuesLoaded(all_issue_ids))
	dispatch(fetchSummariesIfNeeded(list_key))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, list_key, all_user_ids, all_sprint_ids, all_project_ids, all_issue_ids } = new_props
        dispatch(fetchSummariesIfNeeded(list_key))
        dispatch(ensureUsersLoaded(all_user_ids))
        dispatch(ensureSprintsLoaded(all_sprint_ids))
        dispatch(ensureProjectsLoaded(all_project_ids))
        dispatch(ensureIssuesLoaded(all_issue_ids))
    }

    onChangePage() {
        const { dispatch, list_key } = this.props
	dispatch(invalidateList(list_key))
	dispatch(fetchSummariesIfNeeded(list_key))
    }

    onRefresh(event) {
        const { dispatch, list_key } = this.props
	dispatch(invalidateList(list_key))
	dispatch(invalidateAllSummaries())
	dispatch(fetchSummariesIfNeeded(list_key))
	if ( event ) {
	    event.stopPropagation()
	}
    }

    render() {
        const { summaries, list_key, is_loading } = this.props
	return (
	    <div>
              { is_loading && <div>Loading...</div> }
              { ! is_loading &&
                <div>
                  <Pagination list_key={list_key} on_changed={this.onRefresh} />
                  <div className="project-summary-list__project-summaries">
                    {map(summaries, (summary) =>
                        <div key={summary.id} className="project-summary-list__project-summary">
                          <WorkSummary key={summary.id} summary_id={summary.id} />
                        </div> 
                     )}
                  </div>
                </div>
              }
	    </div>
	)
    }
}

function mapStateToProps(state, props) {

    const { item_list } = state
    const { list_key } = props
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const visible_items = getVisibleItems(state, list_key, ENTITY_KEY__WORK_SUMMARY)
    const last_updated = getLastUpdated(state, list_key)
    const loading_item_ids = getLoadingItemIds(state, list_key)
    const all_sprint_ids = getAllSprintIds(state)
    const all_user_ids = getAllUserIds(state)
    const all_project_ids = getAllProjectIds(state)
    const all_issue_ids = getAllIssueIds(state)

    const is_loading = isLoading(state, list_key) ||
                       !haveItemsBeenRetrieved(state, all_sprint_ids, ENTITY_KEY__SPRINT) ||
                       !haveItemsBeenRetrieved(state, all_project_ids, ENTITY_KEY__PROJECT) ||
                       !haveItemsBeenRetrieved(state, all_user_ids, ENTITY_KEY__USER) ||
                       !haveItemsBeenRetrieved(state, all_issue_ids, ENTITY_KEY__ISSUE)

    return {
        list_key: list_key,
        summaries: visible_items,
	summary_ids: visible_item_ids,
        loading_item_ids: loading_item_ids,
        has_items: visible_items && visible_items.length > 0,
        is_loading: is_loading,
        last_updated: last_updated,
        all_sprint_ids: all_sprint_ids,
        all_project_ids: all_project_ids,
        all_user_ids: all_user_ids,
        all_issue_ids: all_issue_ids
    }
}

export default connect(mapStateToProps)(WorkSummaryList)
