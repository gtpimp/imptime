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
                return <IssueToolbarPanel/>
            case 'issues':
                return <IssuesToolbarPanel/>
            case 'list':
                return <ListToolbarPanel/>
            case 'project':
                return <ProjectToolbarPanel/>
            case 'projects':
                return <ProjectsToolbarPanel/>
            case 'sprint':
                return <SprintToolbarPanel/>
            case 'sprints':
                return <SprintsToolbarPanel/>
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
