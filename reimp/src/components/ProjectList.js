import React, { Component } from 'react'
import { indexOf } from 'lodash'
import map from 'lodash/map'
import union from 'lodash/union'
import includes from 'lodash/includes'
import difference from 'lodash/difference'
import { connect } from 'react-redux'
import {
    invalidateList,
    selectItems,
    collapse_list,
    expand_list,
    getVisibleItemIds,
    getVisibleItems,
    isLoading,
    getLastUpdated,
    getLoadingItemIds,
    getSelectedItemIds,
    getSelectedItems,
    getDisplayMode
} from '../actions/ItemList'
import {
    invalidateAllProjects,
    fetchProjectsIfNeeded,
    setLastSelectedProjectId
} from '../actions/Projects'
import { setGloballySelectedProjectId } from '../actions/Page'
import Pagination from './Pagination'
import Project from './Project'
import DivTable from './DivTable'
import '../sass/project-list.scss'
import { ENTITY_KEY__PROJECT } from '../actions/ItemListKeyRegistry'
import { getCellStyle } from '../actions/ItemListKeyRegistry'
import DivTableHeaderRow from './DivTableHeaderRow'
import DivTableHeaderCell from './DivTableHeaderCell'

class ProjectList extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
        this.onChangePage = this.onChangePage.bind(this)
        this.onCollapse = this.onCollapse.bind(this)
        this.onExpand = this.onExpand.bind(this)
        this.renderHeader = this.renderHeader.bind(this)
        this.onDeleteProject = this.onDeleteProject.bind(this)
    }

    switchToSampleContext() {
        const { dispatch, project_ids, sprint_ids } = this.props

        dispatch(selectItems('projects', [project_ids]))
        dispatch(collapse_list('projects'))

        dispatch(selectItems('sprints', [sprint_ids]))
        dispatch(collapse_list('sprints'))
    }

    componentDidMount() {
        const {last_selected_project_id, onSelectProjects, project_id, dispatch} = this.props
        
        this.switchToSampleContext()
        // only fetch on WillReceiveProps so that the pagination has time to take effect from the parent.
        //dispatch(fetchProjectsIfNeeded(list_key))

        if (last_selected_project_id) {
            console.log(project_id, last_selected_project_id)
            dispatch(setGloballySelectedProjectId(project_id))
            onSelectProjects([last_selected_project_id])
        }
    }

    elemInViewport(elem) {
        var bounding = elem.getBoundingClientRect();
        return (
            bounding.top >= 0 &&
            bounding.left >= 0 &&
            bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    componentDidUpdate() {
        const {last_selected_project_id, project_id, dispatch} = this.props

        if (last_selected_project_id) {
            var selected_project_id = "project_" + last_selected_project_id
            var selected_project_row = document.getElementById(selected_project_id)

            if (selected_project_row && !this.elemInViewport(selected_project_row)) {
                selected_project_row.scrollIntoView()
            }            
        }
        
    }
    
    componentWillReceiveProps() {
        const { dispatch, list_key } = this.props
        dispatch(fetchProjectsIfNeeded(list_key))
    }

    onDeleteProject(project_id) {
        const {visible_item_ids} = this.props
        const {onSelectProjects} = this.props
        const project_index = indexOf(visible_item_ids, project_id)
        let next_index = project_index - 1
        if ( next_index < 0 ) {
            next_index = visible_item_ids.length-1
        }
        onSelectProjects([visible_item_ids[next_index]])
    }
    
    onCollapse() {
	const { dispatch, list_key } = this.props
	dispatch(collapse_list(list_key))
    }

    onExpand() {
	const { dispatch, list_key } = this.props
	dispatch(expand_list(list_key))
    }

    onClickedProject(event, project_id) {
        const {dispatch, onSelectProjects, selected_ids} = this.props
        event.stopPropagation()

        let selected_project_ids = []
        if (event.ctrlKey) {
            if (includes(selected_ids, project_id)) {
                selected_project_ids = difference(selected_ids, [project_id])
            } else {
                selected_project_ids = union(selected_ids, [project_id])
            }
        } else {
            selected_project_ids = [project_id]
        }
        dispatch(setGloballySelectedProjectId(project_id))
        dispatch(setLastSelectedProjectId(project_id))
        onSelectProjects(selected_project_ids)
    }

    onChangePage() {
        const { dispatch, list_key } = this.props
	dispatch(invalidateList(list_key))
	dispatch(fetchProjectsIfNeeded(list_key))
    }

    onRefresh(event) {
        const { dispatch, list_key } = this.props
	dispatch(invalidateList(list_key))
	dispatch(invalidateAllProjects())
	dispatch(fetchProjectsIfNeeded(list_key))
	if ( event ) {
	    event.stopPropagation()
	}
    }

    renderHeader() {
        const { header_list } = this.props
        return (
            <DivTableHeaderRow>
              { map(header_list, (v, k) => (
                  <DivTableHeaderCell key={k}
                                      extra_style={getCellStyle(v)}>
                    {v.label }
                  </DivTableHeaderCell>
              ))}
            </DivTableHeaderRow>
        )
    }
    
    renderCollapsedProject(project) {
	const { list_key, loading_item_ids } = this.props
        const is_loading=loading_item_ids.indexOf(project.id) !== -1
        
	return (
	    <div key={"collapsed_project_"+project.id+"_"+list_key}>
              { is_loading && "Loading..." }
              { ! is_loading &&
                <div>
                  Project: {project.name}
                </div>
              }
	    </div>
	)
    }

    render_collapsed() {
	const { selected_items } = this.props

	return (
	    <div className="panel panel--collapsed">
	      <div className="panel-heading" onClick={this.onExpand}>
		<div className="panel__title">
		  { selected_items.map((project, index) => this.renderCollapsedProject(project)) }
		</div>
	      </div>
	    </div>
	)
    }

    renderExpandedProject(project, index) {
        const { list_key, loading_item_ids, selected_ids, header_list } = this.props
        const that = this

        const is_loading = loading_item_ids.indexOf(project.id) !== -1 || project.loaded === false
        
        return (
            <Project key={list_key + "_" + project.id + "_" + project.name + "_" + index}
                     is_collapsed={false}
                     reorderProjects={that.reorderProjects}
                     onDelete={that.onDeleteProject}
                     onClickedProject={(event) => that.onClickedProject(event, project.id)}
                     is_loading={is_loading}
                     header_list={header_list}
                     is_selected={selected_ids.indexOf(project.id) !== -1}
                     project_id={project.id}
            />
        )
    }

    render_expanded() {

        const { projects} = this.props

        return (
            <DivTable renderHeader={this.renderHeader}>
              {projects.map((project, index) => this.renderExpandedProject(project, index))}
            </DivTable>
        )

    }

    render() {
        const { list_key } = this.props
	return (
	    <div>
              { this.render_expanded() }
              <Pagination list_key={list_key}
                          on_changed={this.onChangePage} />
	    </div>
	)
    }
}

function mapStateToProps(state, props) {
    const { project } = state
    const { list_key, header_list } = props
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const visible_items = getVisibleItems(state, list_key, ENTITY_KEY__PROJECT)
    const selected_item_ids = getSelectedItemIds(state, list_key)
    const selected_items = getSelectedItems(state, list_key, ENTITY_KEY__PROJECT)
    const display_mode = getDisplayMode(state, list_key) || "expanded"
    const loading_item_ids = getLoadingItemIds(state, list_key)
    const is_loading = isLoading(state, list_key)
    const last_updated = getLastUpdated(state, list_key)
    const last_selected_project_id = project.last_selected_project_id || null

    return {
        list_key: list_key,
        visible_item_ids,
        projects: visible_items,
        project_ids: visible_item_ids,
        loading_item_ids,
        selected_ids: selected_item_ids,
        selected_items,
        has_items: visible_items && visible_items.length > 0,
        is_loading,
        is_collapsed: display_mode === "collapsed",
        is_expanded: display_mode === "expanded" || display_mode,
        last_updated,
        header_list,
        last_selected_project_id: last_selected_project_id
    }
}

export default connect(mapStateToProps)(ProjectList)
