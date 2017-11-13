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
    invalidateAllProjectDashboards,
    fetchProjectDashboardsIfNeeded,
    getAllSprintIds,
    getAllUserIds,
    getAllProjectIds
} from '../actions/ProjectDashboards'
import {ensureUsersLoaded} from '../actions/Users'
import {ensureProjectsLoaded} from '../actions/Projects'
import {ensureSprintsLoaded, getSprints} from '../actions/Sprints'
import ProjectDashboard from './ProjectDashboard'
import '../sass/project-dashboard-list.scss'
import {
    ENTITY_KEY__PROJECT_DASHBOARD,
    ENTITY_KEY__SPRINT,
    ENTITY_KEY__PROJECT,
    ENTITY_KEY__USER
} from '../actions/ItemListKeyRegistry'
import Pagination from './Pagination'

class ProjectDashboardList extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
	this.onChangePage = this.onChangePage.bind(this)
    }

    componentDidMount() {
	const { dispatch, list_key, all_user_ids, all_sprint_ids, all_project_ids } = this.props
	dispatch(initList(list_key))
        dispatch(update_list_pagination(list_key, { page_size: 1 }))
        dispatch(ensureUsersLoaded(all_user_ids))
        dispatch(ensureSprintsLoaded(all_sprint_ids))
        dispatch(ensureProjectsLoaded(all_project_ids))
	dispatch(fetchProjectDashboardsIfNeeded(list_key))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, list_key, all_user_ids, all_sprint_ids, all_project_ids } = new_props
        dispatch(fetchProjectDashboardsIfNeeded(list_key))
        dispatch(ensureUsersLoaded(all_user_ids))
        dispatch(ensureSprintsLoaded(all_sprint_ids))
        dispatch(ensureProjectsLoaded(all_project_ids))
    }

    onChangePage() {
        const { dispatch, list_key } = this.props
	dispatch(invalidateList(list_key))
	dispatch(fetchProjectDashboardsIfNeeded(list_key))
    }

    onRefresh(event) {
        const { dispatch, list_key } = this.props
	dispatch(invalidateList(list_key))
	dispatch(invalidateAllProjectDashboards())
	dispatch(fetchProjectDashboardsIfNeeded(list_key))
	if ( event ) {
	    event.stopPropagation()
	}
    }

    render() {
        const { project_dashboards, list_key, is_loading } = this.props
	return (
	    <div>
              <div>Project Dashboards</div>
              { is_loading && <div>Loading...</div> }
              { ! is_loading &&
                <div>
                  <Pagination list_key={list_key} on_changed={this.onRefresh} />
                  <div className="project-dashboard-list__project-dashboards">
                    {map(project_dashboards, (project_dashboard) =>
                        <div key={project_dashboard.id} className="project-dashboard-list__project-dashboard">
                          <ProjectDashboard key={project_dashboard.id} project_id={project_dashboard.project_id} />
                        </div> 
                     )}
                  </div>
                  <Pagination list_key={list_key} on_changed={this.onRefresh} />
                </div>
              }
	    </div>
	)
    }
}

function mapStateToProps(state, props) {

    const { project, item_list } = state
    const { list_key } = props
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const visible_items = getVisibleItems(state, list_key, ENTITY_KEY__PROJECT_DASHBOARD)
    const last_updated = getLastUpdated(state, list_key)
    const loading_item_ids = getLoadingItemIds(state, list_key)
    const all_sprint_ids = getAllSprintIds(state)
    const all_user_ids = getAllUserIds(state)
    const all_project_ids = getAllProjectIds(state)

    const is_loading = isLoading(state, list_key) ||
                       !haveItemsBeenRetrieved(state, all_sprint_ids, ENTITY_KEY__SPRINT) ||
                       !haveItemsBeenRetrieved(state, all_project_ids, ENTITY_KEY__PROJECT)
                       !haveItemsBeenRetrieved(state, all_user_ids, ENTITY_KEY__USER)
    
    return {
        list_key: list_key,
        project_dashboards: visible_items,
	project_ids: visible_item_ids,
        loading_item_ids: loading_item_ids,
        has_items: visible_items && visible_items.length > 0,
        is_loading: is_loading,
        last_updated: last_updated,
        all_sprint_ids: all_sprint_ids,
        all_project_ids: all_project_ids,
        all_user_ids: all_user_ids
    }
}

export default connect(mapStateToProps)(ProjectDashboardList)
