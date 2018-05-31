import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    ensureProjectsLoaded, getProject
} from '../actions/Projects'
import {withRouter} from 'react-router-dom'

class ProjectNameUnclickable extends Component {

    constructor(props) {
        super(props)
        this.on_clicked = this.on_clicked.bind(this)
    }

    componentDidMount() {
        this.refresh(this.props)
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(props) {
	const { dispatch, project_id, project } = props
	if ( project.loaded === false ) {
	    dispatch(ensureProjectsLoaded([project_id]))
	}
    }

    render() {
        const { project_id, project, loading_value } = this.props

        if ( ! project_id ) {
            return null
        }

	if ( project.loaded === false ) {
            return <div>{loading_value}</div>
	}

	return (<div>{project.name}</div>)
    }
}

function mapStateToProps(state, props) {
    const { project_id, loading_value } = props
    const project = ((project_id && (getProject(state, project_id))) || { 'loaded': false, 'id': project_id }) || { 'projectname': 'no-one' }

    return {
	project: project,
        project_id: project_id,
	loading_value: loading_value || "..."
    }
}

export default withRouter(connect(mapStateToProps)(ProjectNameUnclickable))
