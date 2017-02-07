import React, {Component} from 'react'
import {connect} from 'react-redux'
import { getProject, ensureProjectsLoaded } from '../../actions/Projects'

class ProjectLabel extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        if ( new_props.project_id !== this.props.project_id ) {
            this.refresh()
        }
    }

    refresh() {
        const { dispatch, project_id } = this.props
        if ( project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
        }
    }

    render() {
        const { project } = this.props
        return (
            <div>
                {project.name}
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { value } = props
    const project_id = value
    const project = getProject(state, project_id) || {}
    
    return {
        project: project
    }
}

export default connect(mapStateToProps)(ProjectLabel)

