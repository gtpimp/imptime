import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../sass/toolbar.css'
import Breadcrumbs from './Breadcrumbs'
import ProjectToolbarPanel from './ProjectToolbarPanel'
import ProjectsToolbarPanel from './ProjectsToolbarPanel'
import SprintToolbarPanel from './SprintToolbarPanel'
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
            case 'project':
                return <ProjectToolbarPanel key="project-panel"/>
            case 'projects':
                return <ProjectsToolbarPanel key="projects-panel"/>
            case 'sprint':
                return <SprintToolbarPanel key="sprint-panel"/>
            case 'sprints':
                return <SprintsToolbarPanel key="sprints-panel"/>
            default:
                throw new Error("Unsupported toolbar panel:", id)
        }
    }

    render() {
        const {breadcrumbs, panelIds} = this.props
        return (
            <div className="toolbar">
                <div className="toolbar__container toolbar__container--left">
                    <Breadcrumbs breadcrumbs={breadcrumbs}/>
                </div>
                <div className="toolbar__container toolbar__container--right">
                    {panelIds.map((panelId) => this.renderPanel(panelId))}
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {breadcrumbs, toolbar} = state

    return {
        panelIds: toolbar.panelIds || ['issue', 'issues', 'project', 'projects', 'sprint', 'sprints', 'list'],
        breadcrumbs: breadcrumbs
    }
}


export default connect(mapStateToProps)(ToolBar)
