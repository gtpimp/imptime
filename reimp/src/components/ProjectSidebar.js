import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import Sidebar from './Sidebar'
import PropertyStack from './PropertyStack'
import PropertyStackComponent from './PropertyStackComponent'
import EditableProjectName from '../components/EditableProjectName'

class ProjectSidebar extends Component {

    constructor(props) {
        super(props)
        this.navigateToSprintsPage = this.navigateToSprintsPage.bind(this)
        this.navigateToProjectDashboard = this.navigateToProjectDashboard.bind(this)
    }

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

    navigateToSprintsPage() {
        const {project_id} = this.props
        browserHistory.push('/projects/' + project_id + '/sprints');
    }

    navigateToProjectDashboard() {
        const {project_id} = this.props
        browserHistory.push('/projects/' + project_id);
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
                    <PropertyStackComponent>
                      <button className="button button--primary issue_sidebar--button"
                              onClick={this.navigateToSprintsPage}>Sprints</button>
                    </PropertyStackComponent>
                    <PropertyStackComponent>
                      <button className="button button--primary issue_sidebar--button"
                              onClick={this.navigateToProjectDashboard}>Dashboard</button>
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
