import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import '../../sass/toolbar-panel.css'
import {
    PAGE_KEY__PROJECTS_PAGE
} from '../../actions/ItemListKeyRegistry'
import {
    startCandidateProject
} from '../../actions/Projects.js'

import { ensureProjectsLoaded, getProject } from '../../actions/Projects'
import {
    get_selected_project_ids
} from '../../actions/Page'

class ProjectsToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.onNewProjectClick = this.onNewProjectClick.bind(this)
        this.onDashboardClick = this.onDashboardClick.bind(this)
        this.onSprintsClick = this.onSprintsClick.bind(this)
        this.onRoadmapClick = this.onRoadmapClick.bind(this)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps() {
        this.refresh()
    }

    refresh() {
        const {dispatch, project_ids} = this.props
        dispatch(ensureProjectsLoaded(project_ids))
    }
    
    onNewProjectClick() {
        const { dispatch } = this.props
        dispatch(startCandidateProject())
    }

    onDashboardClick() {
        const {project_id} = this.props
        browserHistory.push('/projects/' + project_id + '/dashboard/');
    }

    onRoadmapClick() {
        const {project_id} = this.props
        browserHistory.push('/projects/' + project_id + '/roadmap/');
    }

    onSprintsClick() {
        const {project_id} = this.props
        browserHistory.push('/projects/' + project_id + '/sprints');
    }

    render() {
        const { project_id } = this.props
        
        return (
            <div className="toolbar-panel">
              <div className="button button--large button--primary" onClick={this.onNewProjectClick}>
                + New Project
              </div>
              { project_id && 
                <div className="button button--large button--primary" onClick={this.onSprintsClick}>
                  Sprints
                </div>
              }
              { project_id && 
                <div className="button button--large button--primary" onClick={this.onDashboardClick}>
                  Dashboard
                </div>
              }
              { project_id && 
                <div className="button button--large button--primary" onClick={this.onRoadmapClick}>
                  Roadmap
                </div>
              }
              
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const selected_project_ids = get_selected_project_ids(state, PAGE_KEY__PROJECTS_PAGE)
    const project = (selected_project_ids && selected_project_ids.length > 0 && getProject(state, selected_project_ids[0])) || {}
    
    return {
        selected_project_ids: selected_project_ids,
        project_id: project.id
    }
}


export default connect(mapStateToProps)(ProjectsToolbarPanel)
