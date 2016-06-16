import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import {
    invalidateProjects,
    fetchProjectsIfNeeded
} from '../actions/Projects'


export class ProjectTable extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
    }

    componentDidMount() {
	const { dispatch, list_key } = this.props
	dispatch(fetchProjectsIfNeeded(list_key))
    }

    onRefresh() {
        const { dispatch } = this.props
        dispatch(invalidateProjects())
        dispatch(fetchProjectsIfNeeded())
    }

    renderProject(project, index) {
        const {} = this.props
        return (
	    <tr key={project.id+"."+index}>
		<td>{project_id}</td>
		<td>{project.name}</td>
            </tr>
        )
    }

    render() {

        const {projects, is_fetching, has_projects } = this.props

        return (
            <div style={{ opacity: is_fetching ? 0.5 : 1 }}>
		<div className="panel panel--wide">
                    <div className="panel-heading">
			<div className="panel__title">Projects</div>
			<div className="panel__buttons">
                            <div className="panel__button panel__button--refresh"
				 onClick={this.onRefresh}></div>
			</div>
                    </div>
                    <div className="panel-body">
			<table className="table table--default" >
                            <thead>
				<tr>
				    <th>ID</th>
				    <th>Name</th>
				</tr>
                            </thead>
                            <tbody>
				{projects.map((project, index) => this.renderProject(project, index))}
                            </tbody>
			</table>
			{ !is_fetching && !has_projects &&
			  <div className="table__no-rows">no projects</div>
			}
                    </div>
		</div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { projects_by_id, ui_context } = state
    const { list_key } = props
    const context = (ui_context && ui_context[list_key]) || {}
    const visible_ids = context.visible_ids || []
    const projects = (projects_by_id && visible_ids.map( function(visible_id, index) {
	return projects_by_id[visible_id]
    })) || []
    
    return {
        list_key: list_key,
        projects: projects,
        has_projects: projects && projects.length > 0,
        is_fetching: context.is_fetching,
        last_updated: context.last_updated
    }
}

export default connect(mapStateToProps)(ProjectTable)
