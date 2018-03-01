import React, {Component} from 'react'
import '../sass/breadcrumb.css'
import {connect} from 'react-redux'
import {
    PAGE_KEY__PROJECTS_PAGE,
    PAGE_KEY__SPRINTS_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    get_selected_project_ids,
    get_selected_sprint_ids
} from '../actions/Page'
import { getSprint } from '../actions/Sprints'
import { getProject } from '../actions/Projects'
import {browserHistory} from 'react-router'
import {
    startCandidateSprint
} from '../actions/Sprints.js'

class BreadcrumbMenuSprints extends Component {

    constructor(props) {
        super(props)
        this.onNewSprintClick = this.onNewSprintClick.bind(this)
        this.onDashboardClick = this.onDashboardClick.bind(this)
        this.onIssuesClick = this.onIssuesClick.bind(this)
        this.onBulkCreateIssuesClick = this.onBulkCreateIssuesClick.bind(this)
    }

    onNewSprintClick() {
        const { dispatch, project_id, last_selected_sprint_id, selected_sprint_type_filter } = this.props
        const default_sprint_args = {}
        if ( selected_sprint_type_filter != "_all_" ) {
            default_sprint_args.sprint_type = selected_sprint_type_filter
        }
        dispatch(startCandidateSprint(project_id, last_selected_sprint_id, default_sprint_args))
    }
    
    onIssuesClick() {
        const { project_id, sprint } = this.props
        browserHistory.push('/projects/'+project_id+'/sprints/'+sprint.id+'/issues');
    }

    onBulkCreateIssuesClick() {
        const { dispatch, project_id, last_selected_sprint_id } = this.props
        browserHistory.push("/projects/" + project_id + "/sprints/" + last_selected_sprint_id + "/bulkCreate")
    }

    onDashboardClick() {
        const { project_id, last_selected_sprint_id } = this.props
        browserHistory.push('/projects/'+project_id+'/sprints/'+last_selected_sprint_id+'/dashboard');
    }
    
    render() {

        const { sprint_id, sprint } = this.props

        return (
            <div>
              <div className="breadcrumb-menu__item" onClick={this.onNewSprintClick}>
                + New Sprint
              </div>
              { sprint && sprint_id &&
                <div>
                  <div className="breadcrumb-menu__item" onClick={this.onIssuesClick}>
                    Issues
                  </div>
                </div>
              }
              <div className="breadcrumb-menu__item" onClick={this.onBulkCreateIssuesClick}>
                + Bulk Issues
              </div>
              { sprint && sprint_id &&
                <div>
                  <div className="breadcrumb-menu__item" onClick={this.onDashboardClick}>
                    Dashboard
                  </div>
                </div>
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { breadcrumb } = props

    const sprint_id = breadcrumb.selected_entities.sprint_id && breadcrumb.selected_entities.sprint_id[0] || null
    const sprint = getSprint(state, sprint_id)

    return {
        sprint_id,
        sprint
    }

}

export default connect(mapStateToProps)(BreadcrumbMenuSprints)
