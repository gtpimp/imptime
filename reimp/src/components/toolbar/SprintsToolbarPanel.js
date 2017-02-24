import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../../sass/toolbar-panel.css'
import {browserHistory} from 'react-router'
import {
    PAGE_KEY__SPRINTS_PAGE
} from '../../actions/ItemListKeyRegistry'
import {
    startCandidateSprint
} from '../../actions/Sprints.js'
import { ensureSprintsLoaded, getSprint } from '../../actions/Sprints'
import { ensureProjectsLoaded, getProject } from '../../actions/Projects'
import {
    get_selected_project_ids,
    get_selected_sprint_ids
} from '../../actions/Page'

class SprintsToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.onNewProjectClick = this.onNewProjectClick.bind(this)
        this.onDashboardClick = this.onDashboardClick.bind(this)
    }
    
    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps() {
        this.refresh()
    }

    refresh() {
        const {dispatch, sprint_ids, project_id} = this.props
        dispatch(ensureSprintsLoaded(sprint_ids))
        dispatch(ensureProjectsLoaded([project_id]))
    }

    onNewProjectClick() {
        const { dispatch, project_id, last_selected_sprint_id } = this.props
        dispatch(startCandidateSprint(project_id, last_selected_sprint_id))
    }

    onDashboardClick() {
        const { project_id } = this.props
        browserHistory.push('/projects/'+project_id);
    }
    
    render() {

        const { sprint } = this.props
        
        return (
            <div className="toolbar-panel">
                <div className="button button--large button--primary" onClick={this.onNewProjectClick}>
                    + New Sprint
                </div>
                { sprint &&
                  <div>
                      <div className="button button--large button--primary" onClick={this.onDashboardClick}>
                          Dashboard
                      </div>
                  </div>
                }
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const selected_sprint_ids = get_selected_sprint_ids(state, PAGE_KEY__SPRINTS_PAGE)
    const sprint = (selected_sprint_ids && selected_sprint_ids.length > 0 && getSprint(state, selected_sprint_ids[0])) || {}
    const selected_project_ids = get_selected_project_ids(state, PAGE_KEY__SPRINTS_PAGE)
    const project = (selected_project_ids && selected_project_ids.length > 0 && getProject(state, selected_project_ids[0])) || {}
    
    return {
        sprint_ids: selected_sprint_ids,
        sprint: sprint,
        last_selected_sprint_id: sprint.id,
        project_id: project.id
    }
}

export default connect(mapStateToProps)(SprintsToolbarPanel)
