import React, {Component} from 'react'
import {connect} from 'react-redux'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import SidebarContainer from './SidebarContainer'
import SidebarProperty from './SidebarProperty'
import SidebarSectionTitle from './SidebarSectionTitle'
import EditableProjectName from '../components/EditableProjectName'
import EditableProjectDescription from '../components/EditableProjectDescription'
import EditableProjectArchived from '../components/EditableProjectArchived'

class ProjectSidebar extends Component {

    componentDidMount() {
        const {dispatch, project_id} = this.props
        if (project_id) {
            dispatch(ensureProjectsLoaded([project_id]))
        }
    }

    componentWillReceiveProps() {
        const {dispatch, project_id} = this.props
        if (project_id) {
            dispatch(ensureProjectsLoaded([project_id]))
        }
    }

    render() {

        const {project_id} = this.props

        if (!project_id) {
            return null
        }

        return (
            <SidebarContainer>
              <SidebarProperty key="projectname">
                <EditableProjectName project_id={project_id} />
              </SidebarProperty>
              <div key="descriptionstack">
                <SidebarSectionTitle title="Description" />
                <EditableProjectDescription project_id={project_id}/>
                <EditableProjectArchived project_id={project_id}/>
              </div>
            </SidebarContainer>
        )
    }
}

function mapStateToProps(state, props) {
    const {project_id} = props
    const project = getProject(state, project_id)
    return {
        project_id: project_id,
        project: project
    }
}

export default connect(mapStateToProps)(ProjectSidebar)
