import React, { Component } from 'react'
import map from 'lodash/map'
import union from 'lodash/union'
import includes from 'lodash/includes'
import difference from 'lodash/difference'
import { connect } from 'react-redux'
import {
    initList,
    invalidateList,
    selectItems,
    collapse_list,
    expand_list
} from '../actions/ItemList'
import {
    invalidateAllProjects,
    fetchProjectsIfNeeded
} from '../actions/Projects'
import Project from './Project'
import ListTable from './ListTable'
import '../sass/project-list.scss'

class ProjectList extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
	this.onChangePage = this.onChangePage.bind(this)
	this.onCollapse = this.onCollapse.bind(this)
	this.onExpand = this.onExpand.bind(this)
    }

    switchToSampleContext() {
        const { dispatch } = this.props
        var project_id = 167
        var sprint_id = 2373

        dispatch(selectItems('projects', [project_id]))
        dispatch(collapse_list('projects'))

        dispatch(selectItems('sprints', [sprint_id]))
        dispatch(collapse_list('sprints'))
	}

    componentDidMount() {
	const { dispatch, list_key } = this.props
        this.switchToSampleContext()
	dispatch(initList(list_key))
	dispatch(fetchProjectsIfNeeded(list_key))
    }

    componentWillReceiveProps() {
        const { dispatch, list_key } = this.props
        dispatch(fetchProjectsIfNeeded(list_key))
    }

    onCollapse() {
	const { dispatch, list_key } = this.props
	dispatch(collapse_list(list_key))
    }

    onExpand() {
	const { dispatch, list_key } = this.props
	dispatch(expand_list(list_key))
    }

    onClickedProject(project_id) {
        const {onSelectProjects, selected_ids} = this.props
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

    renderCollapsedProject(project) {
	const { list_key } = this.props
	return (
	    <div key={"collapsed_project_"+project.id+"_"+list_key}>
		Project: {project.name}
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
        const { list_key, loading_item_ids, selected_ids } = this.props
        const that = this

        return (
        <Project key={list_key + "_" + project.id + "_" + project.name + "_" + index}
                is_collapsed={false}
                reorderProjects={that.reorderProjects}
                onClickedProject={() => that.onClickedProject(project.id)}
                is_loading={loading_item_ids.indexOf(project.id) !== -1}
                is_selected={selected_ids.indexOf(project.id) !== -1}
                project_id={project.id}
        />
        )
    }

    render_expanded() {

        const { projects} = this.props

        return (
            <ListTable>
                {projects.map((project, index) => this.renderExpandedProject(project, index))}
            </ListTable>
        )

    }

    render() {
	return (
	    <div>
            { this.render_expanded() }
	    </div>
	)
    }
}

function mapStateToProps(state, props) {
    const { project, item_list } = state
    const { list_key } = props
    const items_by_id = (project && project.items_by_id) || {}
    const l = (item_list && item_list[list_key]) || {}
    const visible_item_ids = l.visible_item_ids || []

    const selected_items = items_by_id && l.selected_ids && l.selected_ids.map( function(selected_id, index) {
	return items_by_id[selected_id] || { 'id': selected_id,
					     'loaded': false }
    })

    const items = (items_by_id && visible_item_ids.map( function(visible_item_id, index) {
	return items_by_id[visible_item_id] || { 'id': visible_item_id,
						 'loaded': false }
    })) || []

    if ( ! l.display_mode ) {
        l.display_mode = "expanded"
    }

    return {
        list_key: list_key,
        projects: items,
	project_ids: map(items, 'id'),
        loading_item_ids: l.loading_item_ids || [],
	selected_ids: l.selected_ids || [],
	selected_items: selected_items || [],
        has_items: items && items.length > 0,
        is_loading: l.is_loading,
	is_collapsed: l.display_mode === "collapsed",
	is_expanded: l.display_mode === "expanded" || !l.display_mode,
        last_updated: l.last_updated
    }
}

export default connect(mapStateToProps)(ProjectList)
