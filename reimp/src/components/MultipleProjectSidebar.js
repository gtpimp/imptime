import React, {Component} from 'react'
import {connect} from 'react-redux'
// import PropertyStack from './PropertyStack'
// import PropertyStackComponent from './PropertyStackComponent'
// import ProjectDescription from './ProjectDescription'
import Sidebar from './Sidebar'
import {ensureProjectsLoaded, getProjects} from '../actions/Projects'

class MultipleProjectSidebar extends Component {

    componentDidMount() {
        const {project_ids, dispatch} = this.props
        dispatch(ensureProjectsLoaded(project_ids))
    }

    componentWillReceiveProps(new_props) {
        const {dispatch} = this.props
        dispatch(ensureProjectsLoaded(new_props.project_ids))
    }
    
    render() {

        const {projects} = this.props
        
        return (

            <Sidebar>

                <div>
                    { projects.length } projects selected
                </div>

            </Sidebar>
        )
    }
}

function mapStateToProps(state, props) {
    const {project_ids, project_id} = props
    const projects = getProjects(state, project_ids) || {}
    return {
        projects: projects || [],
        project_ids: project_ids,
        project_id: project_id
    }
}

export default connect(mapStateToProps)(MultipleProjectSidebar)
