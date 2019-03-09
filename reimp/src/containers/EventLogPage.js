import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import {setProjectBreadcrumbsHelper} from '../actions/Breadcrumbs'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import EventLog from '../components/EventLog'
import {
    PAGE_KEY__EVENT_LOG_PAGE,
    LIST_KEY__EVENT_LOG
} from '../actions/ItemListKeyRegistry'
import {
    setPageSelectedEntities,
    setGloballySelectedProjectId
} from '../actions/Page'

class EventLogPage extends Component {

    componentDidMount() {
        const {project_id, user_id} = this.props
        this.refresh(project_id, user_id, null, null)
    }

    componentWillReceiveProps(new_props) {
        const { project_id } = this.props
        if ( new_props.project_id !== project_id || new_props.project.id !== this.props.project.id ) {
            this.refresh(new_props.project_id, new_props.project)
        }
    }
    
    refresh(project_id, project, user) {
        const { dispatch } = this.props
        project = project || {}
        if ( project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
            dispatch(setGloballySelectedProjectId(project_id))
            dispatch(setPageSelectedEntities(PAGE_KEY__EVENT_LOG_PAGE,
                                             {project_ids:[project_id]}))
            if ( project.id ) {
                dispatch(setProjectBreadcrumbsHelper(project))
            }
        }
    }

    render() {
        const { project } = this.props
        return (
            <div className="project-user__event_log  main-layout__scroll-panel">
              <h2>
                Event log for {project.name}
              </h2>
              <EventLog project_id={project.id} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const project_id = props.match.params.projectId
    const project = getProject(state, project_id)
        
    return {
        list_key: LIST_KEY__EVENT_LOG,
        project_id,
        project: project || {}
    }
}

export default withRouter(connect(mapStateToProps)(EventLogPage))
