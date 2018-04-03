import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    ensureProjectsLoaded, getProject
} from '../actions/Projects'
import {withRouter} from 'react-router-dom'

class ProjectName extends Component {

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

    on_clicked(event) {
        const { history, project, onClick, open_on_click } = this.props
        event.stopPropagation()
        if ( onClick ) {
            onClick(project.id)
        } else if ( open_on_click ) {
            history.push('/projects/' + project.id);
        }
    }

    render_inline_small() {
	      const { project, loading_value } = this.props

	      return (
	          <div className="project_name--inline-small"
                 key={this.key+".collapsed_project."+project.id}
		             onClick={this.on_clicked}
	          >
	            {project.name }
	          </div>
	      )
    }

    render() {
        const { project_id, project, render_mode, loading_value, onClick } = this.props

        if ( ! project_id ) {
            return ( <div onClick={onClick}></div> )
        }

	      if ( project.loaded === false ) {
	          return ( <div onClick={onClick}>{loading_value}</div> )
	      }

	      if ( render_mode === 'inline--small' ) {
	          return this.render_inline_small()
	      } else {
	          return ( <div>Dev error, unsupported render mode: {render_mode}</div> )
	      }
    }
}

function mapStateToProps(state, props) {
    const { project_id, render_mode, loading_value } = props
    const project = ((project_id && (getProject(state, project_id))) || { 'loaded': false, 'id': project_id }) || { 'projectname': 'no-one' }

    return {
	project: project,
        project_id: project_id,
	render_mode: render_mode || "inline--small",
	loading_value: loading_value || "...",
        onClick: props.onClick,
        open_on_click: props.open_on_click || true
    }
}

export default withRouter(connect(mapStateToProps)(ProjectName))
