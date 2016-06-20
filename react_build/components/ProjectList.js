import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import map from 'lodash/map'
import { connect } from 'react-redux'
import {
    invalidateList,
    selectItems,
    collapse_list,
    expand_list
} from '../actions/ItemList'
import {
    invalidateProjects,
    fetchProjectsIfNeeded
} from '../actions/Projects'
import Pagination from '../components/Pagination'


export class ProjectList extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
	this.onCollapse = this.onCollapse.bind(this)
	this.onExpand = this.onExpand.bind(this)
    }

    componentDidMount() {
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
	const { dispatch, list_key } = this.props
	dispatch(selectItems(list_key, [project_id]))
    }

    onRefresh(event) {
        const { dispatch, project_ids, list_key } = this.props
	dispatch(invalidateList(list_key))
	dispatch(invalidateProjects(project_ids))
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
	const { projects, selected_items } = this.props

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
        const { selected_ids } = this.props

	let selected = selected_ids.indexOf(project.id) !== -1
	
        return (
	    <tr key={project.id+"."+index}
		onClick={() => this.onClickedProject(project.id)}
		className={selected ? 'tr--selected' : ''}
	    >
		{ project.loaded === false &&
		<td>Loading...</td>
		}
		{ project.loaded !== false &&
		  <td>{project.name}</td>
		}
	    </tr>
        )
    }

    render_expanded() {

        const { projects, list_key, is_loading, has_items } = this.props
	
        return (
            <div style={{ opacity: is_loading ? 0.5 : 1 }}>
		<div className="panel panel--default">
                    <div className="panel-heading" onClick={this.onCollapse}>
			<div className="panel__title">Projects</div>
			<div className="panel__buttons">
			    <div className="panel__button panel__button--refresh"
				 onClick={this.onRefresh}></div>
			</div>
                    </div>
                    <div className="panel-body">
			<table className="table table--default" >
                            <tbody>
				{projects.map((project, index) => this.renderExpandedProject(project, index))}
                            </tbody>
			</table>
			{ !is_loading && !has_items &&
			  <div className="table__no-rows">no projects</div>
			}
                    </div>
		    <Pagination list_key={list_key} on_changed={this.onRefresh} />
		</div>
            </div>
        )
    }

    render() {

        const { is_loading, is_collapsed, is_expanded } = this.props

	return (
	    <div>
		{ is_collapsed && this.render_collapsed() }
		{ is_expanded && this.render_expanded() }
	    </div>
	)
    }
}

function mapStateToProps(state, props) {
    const { project, item_list } = state
    const { list_key, only_display_mode } = props
    const items_by_id = project && project.items_by_id || {}
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
    
    return {
        list_key: list_key,
        projects: items,
	project_ids: map(items, 'id'),
	selected_ids: l.selected_ids || [],
	selected_items: selected_items || [],
        has_items: items && items.length > 0,
        is_loading: l.is_loading,
	is_collapsed: l.display_mode == "collapsed",
	is_expanded: l.display_mode == "expanded" || !l.display_mode,
        last_updated: l.last_updated
    }
}

export default connect(mapStateToProps)(ProjectList)
