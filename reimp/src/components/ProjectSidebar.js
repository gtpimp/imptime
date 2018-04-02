import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import Sidebar from './Sidebar'
import PropertyStack from './PropertyStack'
import PropertyStackComponent from './PropertyStackComponent'
import EditableProjectName from '../components/EditableProjectName'
import EditableProjectDescription from '../components/EditableProjectDescription'

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

        const {project_id, project} = this.props

        if (project_id) return (
            <Sidebar>
                <PropertyStack>
                    <PropertyStackComponent>
                        <div className="property--title">
                            <EditableProjectName project_id={project_id} />
                        </div>                        
                    </PropertyStackComponent>
                    <PropertyStackComponent title="Description">
                        <EditableProjectDescription project_id={project_id}/>
                    </PropertyStackComponent>
                </PropertyStack>
            </Sidebar>
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
