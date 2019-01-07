import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map, concat } from 'lodash'
import { AutoSizer } from 'react-virtualized'
import { css }  from 'emotion'
import { ensureProjectsLoaded, getProject } from '../actions/Projects'
import { logged_in_user } from '../actions/Auth'
import 'react-virtualized/styles.css';
import {
    makeSelFeatureIds,
    makeSelFeaturesById,
    makeSelInvalidatedFeatureIds,
    makeSelLoadingFeatureIds,
    makeSelFeatures,
    makeSelFeatureObjectsToRender,
    makeSelFeaturesAsStructuredTree
} from '../selectors/FeatureListSelectors'
import {
    getVisibleItemIds,
    getLastUpdated,
    isLoading,
    getListFilter
} from '../actions/ItemList'
import {
    fetchFeaturesIfNeeded,
} from '../actions/Features'
import FlatFeature from './FlatFeature'

const HACK_NUMBER_TO_PREVENT_DOUBLE_SCROLL = 40

class FlatFeatureList extends Component {

    componentDidMount() {
        const {dispatch, list_key, project_id, onReactRefsCreated} = this.props
        if (project_id) {
            dispatch(fetchFeaturesIfNeeded(list_key))
            dispatch(ensureProjectsLoaded([project_id]))
            this.refresh()
        }
        onReactRefsCreated(this.refs)
    }

    componentWillReceiveProps(new_props) {
        const {dispatch, list_key, project_id } = new_props
        dispatch(fetchFeaturesIfNeeded(list_key))
        dispatch(ensureProjectsLoaded([project_id]))
        this.refresh(new_props)
    }

    componentDidUpdate() {
        const { onReactRefsCreated } = this.props
        onReactRefsCreated(this.refs)
    }

    refresh(these_props) {
    }

    renderFeature(parent_features, feature) {
        const ref = React.createRef()
        this.refs[feature.id] = ref
        return (
            <FlatFeature ref={ref} parent_features={parent_features} feature={feature} />
        )
    }

    renderSubTree(parent_features, feature) {
        if ( ! feature ) {
            return null
        }
        
        const res = (
            <div key={`feature_${feature.id}`}>
              {this.renderFeature(parent_features, feature)}
              { map(feature.children, (child) => this.renderSubTree(concat(parent_features, [feature]), child)) }
            </div>
        )
        
        return res
    }
    
    render() {
        const { features_as_structured_tree, renderableRef } = this.props
        this.refs = {}
        return (
            <AutoSizer>
              {({width, height}) => (
                  <div style={{height:`${height-HACK_NUMBER_TO_PREVENT_DOUBLE_SCROLL}px`, width:`${width}px`}}>
                    <div ref={renderableRef}>
                      {this.renderSubTree([], features_as_structured_tree[0])}
                    </div>
                  </div>
              )}
            </AutoSizer>
        )
    }
}

const makeMapStateToProps = () => {
    const selFeatureIds = makeSelFeatureIds()
    const selFeaturesById = makeSelFeaturesById()
    const selInvalidatedFeatureIds = makeSelInvalidatedFeatureIds()
    const selLoadingFeatureIds = makeSelLoadingFeatureIds()
    const selFeatures = makeSelFeatures()
    const selFeatureObjectsToRender = makeSelFeatureObjectsToRender()
    const selFeaturesAsStructuredTree = makeSelFeaturesAsStructuredTree()
    const mapStateToProps = (state, props) => {
        const {list_key, header_list, onReactRefsCreated, renderableRef} = props
        const filter = getListFilter(state, list_key)
        const project_id = filter.project_id || null
        const project = getProject(state, project_id) || {}
        const visible_item_ids = getVisibleItemIds(state, list_key)
        const items_by_id = selFeaturesById(state, props)
        const loading_item_ids = selLoadingFeatureIds(state, props)
        const invalidated_item_ids = selInvalidatedFeatureIds(state, props)
        const items = selFeatures(state, props)
        const feature_items = selFeatureObjectsToRender(state, props)
        const logged_in_user_id = logged_in_user(state).user_id
        const feature_ids = selFeatureIds(state, props)
        const features_as_structured_tree = selFeaturesAsStructuredTree(state, props)

        return {
            list_key: list_key,
            visible_item_ids,
            project_id: project_id,
            project,
            features: items,
            features_as_structured_tree,
            feature_items,
            features_by_id: items_by_id,
            feature_ids,
            invalidated_feature_ids: invalidated_item_ids,
            loading_item_ids: loading_item_ids,
            has_items: items && items.length > 0,
            is_loading: isLoading(state, list_key),
            last_updated: getLastUpdated(state, list_key),
            header_list: header_list,
            logged_in_user_id,
            onReactRefsCreated,
            renderableRef
        }
    }
    return mapStateToProps
}

export default connect(makeMapStateToProps)(FlatFeatureList)

