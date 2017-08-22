import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ensureProjectsLoaded, getProject } from '../actions/Projects'
import {
    ensureProjectStatementLoaded,
    getProjectStatement,
    isLoadingProjectStatement
} from '../actions/ProjectStatement'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import {
    PAGE_KEY__PROJECT_DASHBOARD_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    PAGE_KEY__SPRINTS_PAGE,
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
        dispatch(ensureProjectStatementLoaded([project_id]))
        this.refresh(project)
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = this.props
        dispatch(ensureProjectsLoaded([new_props.project_id]))
        dispatch(ensureProjectStatementLoaded([new_props.project_id]))
        if ( new_props.project.name !== this.props.project.name ) {
            this.refresh(new_props.project)
        }
    }

    refresh(project) {
        const { dispatch } = this.props
        dispatch(select_projects(PAGE_KEY__PROJECT_DASHBOARD_PAGE, [project.id]))
        dispatch(setBreadcrumbs([ {to: '/projects', label: 'All Projects'},
                                  {to: '/projects/'+project.id, label: project.name},
                                  {to: '/projects/'+project.id+'/projectStatement', label: 'Project Statement'}]))
    }

    render() {

        const { is_loading, project_statement } = this.props

        return (
            <div>
              { is_loading &&
                <div>
                  <br/>
                  Loading...
                </div>
              }

              { ! is_loading &&
                <div>
                  {project_statement.project_id}
                </div>
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const project_id = props.params.projectId
    const project = getProject(state, project_id) || {}
    const project_statement = getProjectStatement(state, project_id) || {}
    const is_loading = isLoadingProjectStatement(state, project_id)

    return {
        project_id: project_id,
        project: project,
        project_statement: project_statement,
        is_loading: is_loading,
    }
}

export default connect(mapStateToProps)(ProjectStatementPage)
