import React, {Component} from 'react'
import {connect} from 'react-redux'
import {includes} from 'lodash'
import {withRouter} from 'react-router-dom'
import {setFeatureBreadcrumbsHelper} from '../actions/Breadcrumbs'
import {
    LIST_KEY__FEATURE_LIST,
    PAGE_KEY__FEATURES_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    selectItems,
    update_list_filter,
    invalidateList,
    getListFilter
} from '../actions/ItemList'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {
    set_toolbars,
    select_features,
    select_projects,
    get_selected_feature_ids,
    setBrowserTitle,
    setGloballySelectedProjectId
} from '../actions/Page'

class FlatFeaturesPage extends Component {

    componentDidMount() {
        const {dispatch, project_id, list_key, page_key} = this.props
        dispatch(set_toolbars(page_key, ['features']))
        const new_filter = { project_id: project_id }
        dispatch(update_list_filter(list_key, Object.assign({}, new_filter)))
        dispatch(setGloballySelectedProjectId(project_id))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {

        const { dispatch, list_key, default_filter } = new_props
        if ( new_props.project_id !== this.props.project_id ) {
            dispatch(update_list_filter(list_key, Object.assign({},
                                                                default_filter,
                                                                {project_id: new_props.project_id})))
            dispatch(setGloballySelectedProjectId(new_props.project_id))
        }
        
        if ( new_props.project !== this.props.project ||
             new_props.project_id !== this.props.project_id ||
             new_props.project.name !== this.props.project.name ) {
            
            this.refresh(new_props)
        }
    }

    refresh(these_props) {
        const props = these_props || this.props
        const {dispatch, project_id, list_key, page_key,
               default_feature_id, project} = props
        if ( project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
        }
        if (project && project.id) {
            dispatch(select_projects(page_key, [project.id]))
            dispatch(invalidateList(list_key))
            dispatch(setFeatureBreadcrumbsHelper(project))
        }
    }

    render() {

        const {show_sidebar, project } = this.props

        setBrowserTitle(project.name)
        
        return (
            <div>
              Flat features
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {feature} = state
    const default_filter = props.default_filter || {}
    let list_key = props.list_key || LIST_KEY__FEATURE_LIST
    let page_key = props.page_key || PAGE_KEY__FEATURES_PAGE
    const filter = getListFilter(state, list_key)
    const items_by_id = (feature && feature.items_by_id) || {}

    const project_id = props.match.params.projectId
    const default_feature_id = props.match.params.featureId
    const project = getProject(state, project_id) || {}
    const project_name = project.name

    return {
        list_key,
        page_key,
        default_filter,
        filter,
        project_id: project_id,
        project: project || {},
        project_name
    }
}

export default withRouter(connect(mapStateToProps)(FlatFeaturesPage))
