import React, { Component } from 'react'
import { connect } from 'react-redux'
import {withRouter} from 'react-router-dom'

class ProjectLink extends Component {

    constructor(props) {
        super(props)
        this.on_clicked = this.on_clicked.bind(this)
    }
    
    on_clicked() {
        const { project_id, history, onClick, open_on_click } = this.props
        if ( onClick ) {
            onClick(project_id)
        } else if ( open_on_click ) {
            history.push('/projects/' + project_id);
        }
    }
    
    render() {
        const { project_id, project_name, onClick } = this.props

        return (
            <div className="project_link" onClick={this.on_clicked}>
	      {project_name}
	    </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { project_id, project_name } = props

    return {
        project_name: project_name,
        project_id: project_id,
        onClick: props.onClick,
        open_on_click: props.open_on_click || true
    }
}

export default connect(mapStateToProps)(withRouter(ProjectLink))
