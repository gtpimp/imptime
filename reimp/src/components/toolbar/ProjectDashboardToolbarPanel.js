import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import '../../sass/toolbar-panel.css'
import ToolbarButton from './ToolbarButton'
import ReactTooltip from 'react-tooltip'
import {
    PAGE_KEY__PROJECT_DASHBOARD_PAGE
} from '../../actions/ItemListKeyRegistry'

class ProjectDashboardToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.onDeleteProjectClick = this.onDeleteProjectClick.bind(this)
        this.onOpenProjectClick = this.onOpenProjectClick.bind(this)
        this.navigateToSprintsPage = this.navigateToSprintsPage.bind(this)
        this.navigateToSprintTemplatesPage = this.navigateToSprintTemplatesPage.bind(this)
        this.navigateToProjectUsersPage = this.navigateToProjectUsersPage.bind(this)
        this.navigateToProjectStatementPage = this.navigateToProjectStatementPage.bind(this)
        this.navigateToProjectRoadmapPage = this.navigateToProjectRoadmapPage.bind(this)
    }

    onDeleteProjectClick() {
        console.log('delete project clicked')
        alert("Deletion of project not available yet")
    }

    onOpenProjectClick() {
        const { project_id } = this.props
        browserHistory.push('/projects/'+project_id+'/sprints');
    }

    navigateToSprintsPage() {
        const { project_id } = this.props
        browserHistory.push('/projects/'+project_id+'/sprints');
    }

    navigateToSprintTemplatesPage() {
        const { project_id } = this.props
        browserHistory.push('/projects/'+project_id+'/sprintTemplates');
    }

    navigateToProjectUsersPage() {
        const { project_id } = this.props
        browserHistory.push('/projects/'+project_id+'/users');
    }

    navigateToProjectStatementPage() {
        const { project_id } = this.props
        browserHistory.push('/projects/'+project_id+'/projectStatement');
    }

    navigateToProjectRoadmapPage() {
        const { project_id } = this.props
        browserHistory.push('/projects/'+project_id+'/roadmap');
    }

    render() {
        return (
            <div className="toolbar-panel">
              
              <button className="button button--large button--primary" onClick={this.navigateToSprintsPage}>Sprints</button>
              <button className="button button--large button--primary" onClick={this.navigateToSprintTemplatesPage}>Templates</button>
              <button className="button button--large button--primary" onClick={this.navigateToProjectUsersPage}>Users</button>
              <button className="button button--large button--primary" onClick={this.navigateToProjectStatementPage}>Project Statement</button>
              <button className="button button--large button--primary" onClick={this.navigateToProjectRoadmapPage}>Roadmap</button>
              <ToolbarButton tooltip="Back" icon="subdirectory_arrow_left" onClick={this.onOpenProjectClick}/>
              <ToolbarButton tooltip="Delete" icon="delete" onClick={this.onDeleteProjectClick}/>
              <ReactTooltip place="bottom" type="info" />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const page = state.page || {}
    const selected_project_ids = (page[PAGE_KEY__PROJECT_DASHBOARD_PAGE] || {}).project_ids || []
    const project_id = (selected_project_ids.length > 0 && selected_project_ids[0]) || null

    return {
        project_id: project_id
    }
}


export default connect(mapStateToProps)(ProjectDashboardToolbarPanel)
