import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../../sass/toolbar.css'
import Breadcrumbs from '../../components/Breadcrumbs'
import ProjectDashboardToolbarPanel from './ProjectDashboardToolbarPanel'
import ProjectsToolbarPanel from './ProjectsToolbarPanel'
import SprintDashboardToolbarPanel from './SprintDashboardToolbarPanel'
import SprintsToolbarPanel from './SprintsToolbarPanel'
import IssueToolbarPanel from './IssueToolbarPanel'
import IssuesToolbarPanel from './IssuesToolbarPanel'
import ListToolbarPanel from './ListToolbarPanel'

class ToolBar extends Component {

    renderPanel(id) {
        switch(id) {
            case 'issue':
                return <IssueToolbarPanel key="issue-panel"/>
            case 'issues':
                return <IssuesToolbarPanel key="issues-panel"/>
            case 'list':
                return <ListToolbarPanel key="list-panel"/>
            case 'project-dashboard':
                return <ProjectDashboardToolbarPanel key="project-dashboard-panel"/>
            case 'projects':
                return <ProjectsToolbarPanel key="projects-panel"/>
            case 'sprint-dashboard':
                return <SprintDashboardToolbarPanel key="sprint-dashboard-panel"/>
            case 'sprints':
                return <SprintsToolbarPanel key="sprints-panel"/>
            default:
                throw new Error("Unsupported toolbar panel:" + id)
        }
    }

    render() {
        const {breadcrumbs, panelIds} = this.props
        return (
            <div className="toolbar">
                <div className="toolbar__container toolbar__container--left">
                    <Breadcrumbs />
                </div>
                <div className="toolbar__container toolbar__container--right">
                    {panelIds.map((panelId) => this.renderPanel(panelId))}
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const page_toolbars = state.page.toolbar_names || []
    
    return {
        panelIds: page_toolbars // ['issue', 'issues', 'project', 'projects', 'sprint', 'sprints', 'list'],
    }
}


export default connect(mapStateToProps)(ToolBar)
