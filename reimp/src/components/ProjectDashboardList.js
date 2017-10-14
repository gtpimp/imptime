import React, { Component } from 'react'
import map from 'lodash/map'
import union from 'lodash/union'
import includes from 'lodash/includes'
import difference from 'lodash/difference'
import { connect } from 'react-redux'
import {
    initList,
    invalidateList,
    getVisibleItemIds,
    getVisibleItems,
    isLoading,
    getLastUpdated,
    getLoadingItemIds
} from '../actions/ItemList'
import {
    invalidateAllProjectDashboards,
    fetchProjectDashboardsIfNeeded
} from '../actions/ProjectDashboards'
import ProjectDashboard from './ProjectDashboard'
import '../sass/project-dashboard-list.scss'
import { ENTITY_KEY__PROJECT_DASHBOARD } from '../actions/ItemListKeyRegistry'

class ProjectDashboardList extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
	this.onChangePage = this.onChangePage.bind(this)
    }

    componentDidMount() {
	const { dispatch, list_key } = this.props
	dispatch(initList(list_key))
	dispatch(fetchProjectDashboardsIfNeeded(list_key))
    }

    componentWillReceiveProps() {
        const { dispatch, list_key } = this.props
        dispatch(fetchProjectDashboardsIfNeeded(list_key))
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
        const { project_dashboards } = this.props
	return (
	    <div>
              <div>Project Dashboards</div>
              <div className="project-dashboard-list__project-dashboards">
                {map(project_dashboards, (project_dashboard) =>
                    <div className="project-dashboard-list__project-dashboard">
                      <ProjectDashboard key={project_dashboard.id} project_id={project_dashboard.project_id} />
                    </div> 
                 )}
              </div>
	    </div>
	)
    }
}

function mapStateToProps(state, props) {

    const { project, item_list } = state
    const { list_key } = props
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const visible_items = getVisibleItems(state, list_key, ENTITY_KEY__PROJECT_DASHBOARD)
    const is_loading = isLoading(state, list_key)
    const last_updated = getLastUpdated(state, list_key)
    const loading_item_ids = getLoadingItemIds(state, list_key)
    
    return {
        list_key: list_key,
        project_dashboards: visible_items,
	project_ids: visible_item_ids,
        loading_item_ids: loading_item_ids,
        has_items: visible_items && visible_items.length > 0,
        is_loading: is_loading,
        last_updated: last_updated
    }
}

export default connect(mapStateToProps)(ProjectDashboardList)
