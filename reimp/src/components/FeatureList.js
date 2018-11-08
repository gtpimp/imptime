import React, {Component} from 'react'
import {connect} from 'react-redux'
import Floater from "react-floater"
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'
import { ensureProjectsLoaded, getProject } from '../actions/Projects'
import Pluralize from 'react-pluralize'
import { logged_in_user } from '../actions/Auth'
import CommonTree from './CommonTree'
import ProgressBar from './ProgressBar'
import Hours from './Hours'
import 'react-virtualized/styles.css'
import { HEADER_LIST_NAME__FEATURE } from '../actions/ItemListKeyRegistry'
import {
    makeSelFeatureIds,
    makeSelFeaturesById,
    makeSelInvalidatedFeatureIds,
    makeSelLoadingFeatureIds,
    makeSelSelectedFeatures,
    makeSelSavingFeatureIds, 
    makeSelFeatures,
    makeSelFeatureObjectsToRender,
    makeSelFeaturesAsStructuredTree
} from '../selectors/FeatureListSelectors'
import {
    getVisibleItemIds,
    getSelectedItemIds,
    getHighlightedItemIds,
    getLastUpdated,
    isLoading,
    getListFilter
} from '../actions/ItemList'
import {
    fetchFeaturesIfNeeded,
    getCandidateFeature,
    updateFeaturePosition,
    expandFeatureInTree,
    cancelCandidateFeature,
    ALL_AVAILABLE_FEATURE_HEADERS
} from '../actions/Features'

class FeatureList extends Component {

    componentDidMount() {
        const {dispatch, list_key, project_id} = this.props
        if (project_id) {
            dispatch(fetchFeaturesIfNeeded(list_key))
            dispatch(ensureProjectsLoaded([project_id]))
        }
    }

    componentWillReceiveProps(new_props) {
        const {dispatch, list_key, project_id } = new_props
        const {onSelectFeatures} = this.props
        if ( this.props.project_id !== new_props.project_id ) {
            onSelectFeatures([])
        }
        dispatch(fetchFeaturesIfNeeded(list_key))
        dispatch(ensureProjectsLoaded([project_id]))
    }

    onSelectedFeature = (node) => {
        const {dispatch, onSelectFeatures} = this.props
        let selected_features = [node]
        if ( onSelectFeatures )  {
            onSelectFeatures(selected_features)
        }
        dispatch(cancelCandidateFeature())
    }
   
    onReorder = ({node, new_parent, sibling_node_before}) => {
        const { dispatch } = this.props
        dispatch(updateFeaturePosition(node.id,
                                       (new_parent && new_parent.id) || null,
                                       (sibling_node_before && sibling_node_before.id) || null))
    }

    onExpandCollapse = ({node, expanded}) => {
        const { dispatch } = this.props
        if ( node ) {
            dispatch(expandFeatureInTree(node.id, expanded))
        }
    }

    renderFeatureIcons = (rowInfo) => {
        const feature = rowInfo.node
        const { nested_stats } = feature
        const icons = []

        if ( nested_stats.estimated_hours || nested_stats.hours_clocked ) {
            icons.push(
                <div>
                  <Floater
                      title="Progress (hours)"
                      disableHoverToClick
                      event="hover"
                      eventDelay={0}
                      placement="right"
                      content={
                          <div>
                            <div>Hours clocked: <Hours hours={nested_stats.hours_clocked}/></div>
                            <div>Total estimates: <Hours hours={nested_stats.estimated_hours}/></div>
                          </div>
                              }
                  >
                          <div className={css`min-width:100px;font-size:${theme.font_sizes.superscript}`}>
                            <ProgressBar current={nested_stats.hours_clocked} max={nested_stats.estimated_hours}/>
                            <div className={css`display:flex`}>
                              <Hours hours={nested_stats.hours_clocked}/> / <Hours hours={nested_stats.estimated_hours}/>
                            </div>
                          </div>
                  </Floater>
                </div>
            )
        }

        if ( nested_stats.num_features_missing_testables > 0 ||
             nested_stats.num_testables_without_issues > 0 ||
             nested_stats.num_not_fully_implemented_testables > 0 ||
             nested_stats.num_unestimated_issues > 0 ) {
            
            icons.push(
                  <Floater
                      title="Feature problems"
                      disableHoverToClick
                      event="hover"
                      eventDelay={0}
                      placement="right"
                      content={
                          <div>
                              { nested_stats.num_features_missing_testables > 0 &&
                                <div className="floater__section">
                                  <div>
                                    This feature (or its children) is missing&nbsp;
                                    <Pluralize singular="testable" count={nested_stats.num_features_missing_testables}/>.
                                  </div>
                                </div>
                              }
                              { nested_stats.num_testables_without_issues > 0 &&
                                <div className="floater__section">
                                  <div>
                                    This feature (or its children) has&nbsp;
                                    <Pluralize singular="testable" count={nested_stats.num_testables_without_issues}/> without issues.
                                  </div>
                                </div>
                              }
                              { nested_stats.num_not_fully_implemented_testables > 0 &&
                                <div className="floater__section">
                                  <div>
                                    This feature (or its children) has&nbsp;
                                    <Pluralize singular="testable" count={nested_stats.num_not_fully_implemented_testables}/>
                                    that&nbsp;
                                    <Pluralize singular="isn't" plural="aren't" showCount={false} count={nested_stats.num_not_fully_implemented_testables}/>
                                    &nbsp;exactly matched by an issue.
                                  </div>
                                </div>
                              }
                              { nested_stats.num_unestimated_issues > 0 &&
                                <div className="floater__section">
                                  <div>
                                    This feature (or its children) has&nbsp;
                                    <Pluralize singular="issue" count={nested_stats.num_unestimated_issues}/>
                                    that&nbsp;
                                    <Pluralize singular="isn't" plural="aren't" showCount={false} count={nested_stats.num_unestimated_issues}/>
                                    &nbsp;estimated.
                                  </div>
                                </div>
                              }
                          </div>
                      }
                  >
                          <div className="icon icon--warning"></div> 
                  </Floater>
            )
        }
        
        return icons       
    }

    render_tree() {

        const { is_mien_configurer_active, features_by_id, all_headers,
                feature_items, selected_ids, features_as_structured_tree } = this.props

        if ( is_mien_configurer_active ) {
            return this.renderListColumnConfigurer()
        }

        if ( feature_items.length === 0 ) {
            return (
                <div className="div-table__row">
                  <div className="div-table__cell">No features</div>
                </div>
            )
        }

        return (

            <CommonTree items={features_as_structured_tree}
                        items_by_id={features_by_id}
                        onReorder={this.onReorder}
                        renderIcons={this.renderFeatureIcons}
                        onNodeSelected={this.onSelectedFeature}
                        onExpandCollapse={this.onExpandCollapse}
                        all_headers={all_headers}
                        header_list_name={HEADER_LIST_NAME__FEATURE}
                        selected_item_ids={selected_ids}
            >
              {this.renderFeature}
            </CommonTree>
        )
    }

    render() {
        return this.render_tree()
    }
}

const makeMapStateToProps = () => {
    const selFeatureIds = makeSelFeatureIds()
    const selFeaturesById = makeSelFeaturesById()
    const selInvalidatedFeatureIds = makeSelInvalidatedFeatureIds()
    const selLoadingFeatureIds = makeSelLoadingFeatureIds()
    const selSelectedFeatures = makeSelSelectedFeatures()
    const selSavingFeatureIds = makeSelSavingFeatureIds()
    const selFeatures = makeSelFeatures()
    const selFeatureObjectsToRender = makeSelFeatureObjectsToRender()
    const selFeaturesAsStructuredTree = makeSelFeaturesAsStructuredTree()
    const mapStateToProps = (state, props) => {
        const {list_key, onSelectFeatures} = props
        const filter = getListFilter(state, list_key)
        const project_id = filter.project_id || null
        const project = getProject(state, project_id) || {}
        const visible_item_ids = getVisibleItemIds(state, list_key)
        const items_by_id = selFeaturesById(state, props)
        const loading_item_ids = selLoadingFeatureIds(state, props)
        const invalidated_item_ids = selInvalidatedFeatureIds(state, props)
        const saving_item_ids = selSavingFeatureIds(state, props)
        const selected_item_ids = getSelectedItemIds(state, list_key)
        const highlighted_item_ids = getHighlightedItemIds(state, list_key)
        const selected_items = selSelectedFeatures(state, props)
        const items = selFeatures(state, props)
        const candidate_feature = getCandidateFeature(state)
        const is_creating_feature = candidate_feature || false
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
            selected_ids: selected_item_ids,
            selected_items: selected_items,
            highlighted_ids: highlighted_item_ids,
            invalidated_feature_ids: invalidated_item_ids,
            saving_feature_ids: saving_item_ids,
            loading_item_ids: loading_item_ids,
            has_items: items && items.length > 0,
            is_loading: isLoading(state, list_key),
            last_updated: getLastUpdated(state, list_key),
            candidate_feature: candidate_feature,
            is_creating_feature: is_creating_feature,
            all_headers: ALL_AVAILABLE_FEATURE_HEADERS,
            logged_in_user_id,
            onSelectFeatures
        }
    }
    return mapStateToProps
}

export default connect(makeMapStateToProps)(FeatureList)
