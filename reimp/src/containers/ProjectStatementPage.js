import React, {Component} from 'react'
import {connect} from 'react-redux'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {
    PAGE_KEY__PROJECT_DASHBOARD_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
    select_projects,
} from '../actions/Page'

class ProjectStatementPage extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const { project_id, project, dispatch } = this.props
        dispatch(set_toolbars(PAGE_KEY__SPRINTS_PAGE, ['cost-summary']))
        dispatch(ensureProjectsLoaded([project_id]))
        this.refresh(project)
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = this.props
        dispatch(ensureProjectsLoaded([new_props.project_id]))

        if ( new_props.project.name !== this.props.project.name ) {
            this.refresh(new_props.project)
        }
    }

    refresh(project) {
        const { dispatch } = this.props
        dispatch(select_projects(PAGE_KEY__PROJECT_DASHBOARD_PAGE, [project_id]))
        dispatch(setBreadcrumbs([ {to: '/projects', label: 'All Projects'},
                                  {to: '/projects/'+project_id, label: project.name},
                                  {to: '/projects/'+project_id+'/projectStatement', label: 'Project Statement'}]))
        }
    }

    render() {

        const { project_id } = this.props

        return (
            <div>
              test
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const project_id = props.params.projectId
    const project = getProject(state, project_id) || {}
    /* const is_loading = isLoadingCostSummary(state, sprint_id) || isLoadingTimeSummary(state, sprint_id)*/

    return {
        project_id: project_id,
        project: project,
    }
}

export default connect(mapStateToProps)(ProjectStatementPage)
