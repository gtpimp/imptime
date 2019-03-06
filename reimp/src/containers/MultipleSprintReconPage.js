import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { css } from 'emotion'
import { setProjectBreadcrumbsHelper, setBreadcrumbs } from '../actions/Breadcrumbs'
import {ensureProjectsLoaded, getProject } from '../actions/Projects'
import {
    PAGE_KEY__PROJECT_RECON_PAGE,
    LIST_KEY__ISSUES_FOR_PROJECT_RECON
} from '../actions/ItemListKeyRegistry'
import Toolbar from '../components/toolbar/Toolbar'
import {
    set_toolbars,
    setPageSelectedEntities,
    setBrowserTitle
} from '../actions/Page'
import { update_list_filter, initList } from '../actions/ItemList'
import MultipleSprintRecon from '../components/MultipleSprintRecon'

class MultipleSprintReconPage extends Component {

    componentDidMount() {
        const {project_id, dispatch, list_key} = this.props
        dispatch(set_toolbars(PAGE_KEY__PROJECT_RECON_PAGE, ['project-recon']))
        dispatch(initList(list_key))
        dispatch(update_list_filter(list_key, {sprint_status: 'open',
                                               project_id: project_id}))
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(setPageSelectedEntities(PAGE_KEY__PROJECT_RECON_PAGE,
                                         {project_ids: [project_id]}))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        const { project_id, dispatch } = new_props
        dispatch(ensureProjectsLoaded([project_id]))
        
        if ( (new_props.project && (!this.props.project || new_props.project.id !== this.props.project.id)) ) {
            dispatch(setPageSelectedEntities(PAGE_KEY__PROJECT_RECON_PAGE,
                                     {project_ids: [project_id]}))
            this.refresh(new_props)
        }
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, project, project_id } = props

        if ( project ) {
            const auto_set=false
            const breadcrumbs = setProjectBreadcrumbsHelper(project, auto_set)
            breadcrumbs.push({to: '/projects/'+project_id+'/projects/'+project_id+'/recon/',
                              label: "Recon",
                              type: 'project_recon',
                              selected_entities: {project: project}})
            dispatch(setBreadcrumbs(breadcrumbs))
        }
    }
    
    render() {
        const { project, list_key } = this.props
        project && setBrowserTitle(project.name)
        
        return (
            <div className={css`width:100%;height:100%`}>
              <Toolbar />
              <MultipleSprintRecon list_key={list_key} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const project_id = props.match.params.projectId
    const project = getProject(state, project_id)
    
    return {
        project_id,
        project,
        list_key: LIST_KEY__ISSUES_FOR_PROJECT_RECON
    }
}

export default withRouter(connect(mapStateToProps)(MultipleSprintReconPage))
