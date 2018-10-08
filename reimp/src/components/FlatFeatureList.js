import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
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

class FlatFeatureList extends Component {

    componentDidMount() {
        const {dispatch, list_key, project_id} = this.props
        if (project_id) {
            dispatch(fetchFeaturesIfNeeded(list_key))
            dispatch(ensureProjectsLoaded([project_id]))
            this.refresh()
        }
    }

    componentWillReceiveProps(new_props) {
        const {dispatch, list_key, project_id } = new_props
        dispatch(fetchFeaturesIfNeeded(list_key))
        dispatch(ensureProjectsLoaded([project_id]))
        this.refresh(new_props)
    }

    refresh(these_props) {
    }

    renderSubTree(parent_features, feature) {
        if ( ! feature ) {
            return null
        }
        parent_features.push(feature)
        const res = (
            <div key={`feature_${feature.id}`}>
              <FlatFeature parent_features={parent_features} feature={feature} />
              { map(feature.children, (child) => this.renderSubTree(parent_features, child)) }
            </div>
        )
        parent_features.pop(feature)
        return res
    }
    
    render() {
        const { features_as_structured_tree } = this.props
        return (
            this.renderSubTree([], features_as_structured_tree[0])
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
        const {list_key, header_list} = props
        const filter = getListFilter(state, list_key)
        const project_id = filter.project_id || null
        const project = getProject(state, project_id) || {}
        const visible_item_ids = getVisibleItemIds(state, list_key)
        const items_by_id = selFeaturesById(state, props)
        const loading_item_ids = selLoadingFeatureIds(state, props)
        const invalidated_item_ids = selInvalidatedFeatureIds(state, props)
        const items = selFeatures(state, props)
        const feature_items = selFeatureObjectsToRender(state, props)
        const logged_in_user_id = logged_in_user().user_id
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
            logged_in_user_id
        }
    }
    return mapStateToProps
}

export default connect(makeMapStateToProps)(FlatFeatureList)
