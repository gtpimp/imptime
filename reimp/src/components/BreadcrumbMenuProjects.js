import React, {Component} from 'react'
import '../sass/breadcrumb.css'
import {connect} from 'react-redux'
import {
    PAGE_KEY__PROJECTS_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    get_selected_project_ids
} from '../actions/Page'
import { getProject } from '../actions/Projects'
import {browserHistory} from 'react-router'
import {
    startCandidateProject
} from '../actions/Projects.js'

class Breadcrumbmenuprojects extends Component {

    constructor(props) {
        super(props)
        this.onNewProjectClick = this.onNewProjectClick.bind(this)
        this.onDashboardClick = this.onDashboardClick.bind(this)
        this.onSprintsClick = this.onSprintsClick.bind(this)
        this.onRoadmapClick = this.onRoadmapClick.bind(this)
        this.onGalleryClick = this.onGalleryClick.bind(this)
        this.onWikiClick = this.onWikiClick.bind(this)
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

    onGalleryClick() {
        const {project_id} = this.props
        browserHistory.push('/projects/' + project_id + '/gallery/');
    }

    onWikiClick() {
        const {project_id} = this.props
        browserHistory.push('/projects/' + project_id + '/wiki/');
    }

    onSprintsClick() {
        const {project_id} = this.props
        browserHistory.push('/projects/' + project_id + '/sprints');
    }

    render() {
        const { project_id } = this.props

        return (
              <div>
                <div className="breadcrumb-menu__item" onClick={this.onNewProjectClick}>
                  + New Project
                </div>
                { project_id &&
                  <div className="breadcrumb-menu__item" onClick={this.onSprintsClick}>
                    Sprints
                  </div>
                }
                { project_id &&
                  <div className="breadcrumb-menu__item" onClick={this.onDashboardClick}>
                    Dashboard
                  </div>
                }
                { project_id &&
                  <div className="breadcrumb-menu__item" onClick={this.onRoadmapClick}>
                    Roadmap
                  </div>
                }
                { project_id &&
                  <div className="breadcrumb-menu__item" onClick={this.onGalleryClick}>
                    Gallery
                  </div>
                }
                { project_id &&
                  <div className="breadcrumb-menu__item" onClick={this.onWikiClick}>
                    Wiki
                  </div>
                }
              </div>
        )
    }

}

function mapStateToProps(state, props) {

    const { breadcrumb } = props

    const project_id = breadcrumb.selected_entities && breadcrumb.selected_entities.project_id || null

    return {
        project_id
    }

}

export default connect(mapStateToProps)(Breadcrumbmenuprojects)
