import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import { css } from 'emotion'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import {setFeatureBreadcrumbsHelper} from '../actions/Breadcrumbs'
import {
    LIST_KEY__FEATURE_LIST,
    PAGE_KEY__FLAT_FEATURES_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    update_list_filter,
    invalidateList,
    getListFilter
} from '../actions/ItemList'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {
    set_toolbars,
    setPageSelectedEntities,
    setBrowserTitle,
    setGloballySelectedProjectId
} from '../actions/Page'
import FlatFeatureList from '../components/FlatFeatureList'
import Toolbar from '../components/toolbar/Toolbar'

class FlatFeaturesPage extends Component {

    constructor(props) {
        super(props)
        this.renderableFeatureListRef = React.createRef()
    }
    
    componentDidMount() {
        const {dispatch, project_id, list_key, page_key} = this.props
        const params = { navigateToFeature: this.onNavigateToFeature,
                         getComponentRefForPrinting: this.getRefToPrint,
                         list_key: list_key }
        dispatch(set_toolbars(page_key, ['flat-features'], "", params))
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
        const {dispatch, project_id, list_key, page_key, project} = props
        if ( project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
        }
        if (project && project.id) {
            dispatch(setPageSelectedEntities(page_key,
                                     {project_ids:[project.id]}))
            dispatch(invalidateList(list_key))
            dispatch(setFeatureBreadcrumbsHelper(project))
        }
    }

    onFeatureRefsCreated = (refs) => {
        this.feature_refs = refs
    }

    onNavigateToFeature = (feature_id) => {
        const ref = this.feature_refs[feature_id]
        const el_feature = ReactDOM.findDOMNode(ref.current)
        el_feature.scrollIntoView()
    }

    getRefToPrint = () => {
        return this.renderableFeatureListRef.current
    }

    render() {

        const {list_key, project_id, project } = this.props
        setBrowserTitle(project.name)
        
        return (
            <div className={css`width:100%;height:100%`}>
              <Toolbar />
              <FlatFeatureList list_key={list_key}
                               project_id={project_id}
                               renderableRef={this.renderableFeatureListRef}
                               onReactRefsCreated={this.onFeatureRefsCreated} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const default_filter = props.default_filter || {}
    let list_key = props.list_key || LIST_KEY__FEATURE_LIST
    let page_key = props.page_key || PAGE_KEY__FLAT_FEATURES_PAGE
    const filter = getListFilter(state, list_key)

    const project_id = props.match.params.projectId
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

