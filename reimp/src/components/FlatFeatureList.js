import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map, size, slice } from 'lodash'
import { cx, css } from 'emotion'
import { ensureProjectsLoaded, getProject } from '../actions/Projects'
import { default_theme as theme } from '../theme/default'
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
import Testable from './Testable'
import VisualSpecDocumentGallery from './visual_spec/VisualSpecDocumentGallery'
import RenderedMarkdown from './RenderedMarkdown'

class FlatFeatureList extends Component {

    componentDidMount() {
        const {dispatch, list_key, project_id} = this.props
        if (project_id) {
            dispatch(fetchFeaturesIfNeeded(list_key))
            dispatch(ensureProjectsLoaded([project_id]))
        }
    }

    componentWillReceiveProps(new_props) {
        const {dispatch, list_key, project_id } = new_props
        dispatch(fetchFeaturesIfNeeded(list_key))
        dispatch(ensureProjectsLoaded([project_id]))
    }

    renderFeatureDescription(parent_features, feature) {
        return (
            <div className={cx("text-component--readonly text-component--description", css`background-color: ${theme.colours.sub_nav_bar}`)}>
              <h2 className={css`display:flex;`}>
                <div className={css`display:flex;`}>
                  { map(slice(parent_features, 1), (parent) => <div key={`feature_${feature.id}_parent_${parent.id}`}>{parent.name} > </div>)}
                </div>
                <div>{feature.name}</div>
              </h2>

              { size(feature.description) !== 0 && 
                <RenderedMarkdown content={feature.enriched_description || feature.description} />
              }
            </div>
        )
    }

    renderFeatureImages(feature) {
        return (
            <div className={css`display: flex; flex-wrap: wrap; margin-bottom: 20px;`}>
              <VisualSpecDocumentGallery visual_spec_document_ids={feature.visual_spec_document_ids}
                                         feature_id={feature.id}
                                         render_quality="hires"
                                         allow_edit={false} />
            </div>
        )
    }

    renderFeatureTestables(feature) {
        return (
            <div className={css`display: flex; flex-wrap: wrap;`}>
              { map(feature.testables, (testable) =>
                  <div className={css`max-width:25%; margin-left: 30px; margin-right: 30px;`}>
                    <Testable key={`testable_${testable.id}`} testable={testable} />
                  </div>
                ) }
            </div>
        )
    }    

    renderFeature(parent_features, feature) {

        const is_root_element = size(parent_features) === 1
        if ( is_root_element ) {
            return null
        }
        const is_empty = size(feature.testables) === 0 && size(feature.description) === 0 && size(feature.visual_spec_document_ids) === 0
        if ( is_empty ) {
            return null
        }
        
        return (
            <div className={css`margin-bottom: 50px; border-bottom: 2px solid ${theme.colours.cell_separator}`}>
              <div>{this.renderFeatureDescription(parent_features, feature)}</div>
              <div>{this.renderFeatureImages(feature)}</div>
              <div>{this.renderFeatureTestables(feature)}</div>
            </div>
        )
    }
    
    renderSubTree(parent_features, feature) {
        if ( ! feature ) {
            return null
        }
        parent_features.push(feature)
        const res = (
            <div key={`feature_${feature.id}`}>
              { this.renderFeature(parent_features, feature) }
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
