import React, {Component} from 'react'
import {connect} from 'react-redux'
import {includes, map, get} from 'lodash'
import {withRouter} from 'react-router-dom'
import FeatureList from '../components/FeatureList'
import FeatureSidebar from '../components/FeatureSidebar'
import NewFeatureSidebar from '../components/NewFeatureSidebar'
import MultipleFeatureSidebar from '../components/MultipleFeatureSidebar'
import Splitter from '../components/Splitter'
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
    setPageSelectedEntities,
    getPageSelectedEntities,
    setBrowserTitle,
    setGloballySelectedProjectId
} from '../actions/Page'
import {getCandidateFeature} from '../actions/Features'

class FeaturesPage extends Component {

    constructor(props) {
        super(props)
        this.onSelectFeatures = this.onSelectFeatures.bind(this)
    }

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
             new_props.project.name !== this.props.project.name ||
             new_props.selected_feature_id !== this.props.selected_feature_id ||
             new_props.selected_feature.id !== this.props.selected_feature.id ||
             new_props.selected_feature.loaded !== this.props.selected_feature.loaded) {

            
            this.refresh(new_props)
        }
    }

    refresh(these_props) {
        const props = these_props || this.props
        const {dispatch, project_id, list_key, page_key,
               default_feature_id, project, 
               selected_feature_ids, selected_feature} = props
        if ( project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
        }
        if (project && project.id) {
            dispatch(setPageSelectedEntities(page_key,
                                     {project_ids:[project.id]}))
            dispatch(invalidateList(list_key))

            dispatch(setFeatureBreadcrumbsHelper(project, selected_feature))

        }
        if ( default_feature_id !== undefined && !includes(selected_feature_ids, default_feature_id) ) {
            dispatch(selectItems(LIST_KEY__FEATURE_LIST, [default_feature_id]))
            dispatch(setPageSelectedEntities(page_key,
                                     {project_ids: [project_id],
                                      feature_ids: [default_feature_id]}))
        }
    }

    onSelectFeatures(feature_nodes) {
        const {dispatch, history, project_id,
               list_key, page_key} = this.props

        const feature_ids = map(feature_nodes, (feature_node) => feature_node.id)
        dispatch(selectItems(list_key, feature_ids))
        dispatch(setPageSelectedEntities(page_key,
                                 {project_ids: [project_id],
                                  feature_ids: feature_ids}))
        
        if ( feature_ids && feature_ids.length === 1 ) {
            history.push('/projects/'+project_id+'/features/'+feature_ids[0]);
        }
    }

    renderLeftPane() {

        const {project_id, list_key} = this.props
        
        return (
            <FeatureList list_key={list_key}
                         project_id={project_id}
                         onSelectFeatures={this.onSelectFeatures}
            />
        )
    }

    renderRightPane() {
        const { selected_feature, project_id, is_multiple_selection,
                selected_feature_ids, is_creating_feature, is_single_selection } = this.props

        if ( is_creating_feature ) {
            return (
                <div className="list-layout__sidebar">
                  <NewFeatureSidebar />
                </div>
            )
        }
        
        if ( ! is_creating_feature && is_single_selection && project_id && selected_feature ) {
            return (
                <div className="list-layout__sidebar">
                  <FeatureSidebar feature_id={selected_feature.id} project_id={project_id}/>
                </div>
            )
        }
        
        if ( ! is_creating_feature && is_multiple_selection && project_id && selected_feature_ids ) {
            return (
                <div className="list-layout__sidebar">
                  <MultipleFeatureSidebar feature_ids={selected_feature_ids} project_id={project_id}/>
                </div>
            )
        }                              
    }

    render() {

        const {show_sidebar, project } = this.props

        setBrowserTitle(project.name)
        
        return (
            <Splitter name="features_page">
              {this.renderLeftPane()}
              {(show_sidebar && this.renderRightPane()) || null}
            </Splitter>
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
    const selected_feature_ids = get(getPageSelectedEntities(state, page_key), ["feature_ids"])
    
    const selected_items = items_by_id && selected_feature_ids && selected_feature_ids.map(function (selected_id, index) {
        return items_by_id[selected_id] || {'id': selected_id,
                                            'loaded': false }
    })

    const project_id = props.match.params.projectId
    const default_feature_id = props.match.params.featureId
    const project = getProject(state, project_id) || {}
    const project_name = project.name
    const candidate_feature = getCandidateFeature(state) || null
    const is_creating_feature = candidate_feature || false
    const selected_feature = ( selected_items && selected_items.length > 0 && selected_items[0] ) || null
    const show_sidebar = (is_creating_feature || (selected_feature && selected_feature.id)) || false

    return {
        list_key,
        page_key,
        default_filter,
        filter,
        default_feature_id,
        project_id: project_id,
        project: project || {},
        selected_features: selected_items,
        selected_feature: selected_feature || {},
        selected_feature_ids: selected_feature_ids,
        is_single_selection: selected_items && selected_items.length === 1,
        is_multiple_selection: selected_items && selected_items.length > 1,
        is_creating_feature: is_creating_feature,
        show_sidebar,
        project_name
    }
}

export default withRouter(connect(mapStateToProps)(FeaturesPage))
