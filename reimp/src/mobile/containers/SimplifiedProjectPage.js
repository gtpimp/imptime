import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import SimplifiedPage from './SimplifiedPage'
import SimplifiedProject from '../components/SimplifiedProject'
import SimplifiedLoading from '../components/SimplifiedLoading'
import {
    ensureProjectsLoaded,
    getProject,
    isLoadingProjects
} from '../../actions/Projects'

class SimplifiedProjectPage extends Component {

    componentDidMount() {
        const { dispatch, project_id } = this.props
        dispatch(ensureProjectsLoaded([project_id]))
    }

    componentDidUpdate(old_props) {
        const { dispatch, project_id } = this.props
        if ( old_props.project_id !== project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
        }
    }
    
    render() {
        const { project, project_id, is_loading } = this.props

        if ( is_loading ) {
            return <SimplifiedLoading />
        }
        
        return (
            <SimplifiedPage title={project.name}>
              <SimplifiedProject project_id={project_id} />
            </SimplifiedPage>
        )
    }
}

function mapStateToProps(state, props) {

    const project_id = props.match.params.projectId
    const project = getProject(state, project_id)
    const is_loading = isLoadingProjects(state, [project_id]) || !project

    return {
        project_id,
        project,
        is_loading
    }
    
}

export default withRouter(connect(mapStateToProps)(SimplifiedProjectPage))
