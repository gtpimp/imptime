import React, {Component} from 'react'
import {connect} from 'react-redux'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'
import { ensureProjectsLoaded, getProject } from '../actions/Projects'
import { logged_in_user } from '../actions/Auth'
import CommonTree from './CommonTree'
import DivTableCell from './DivTableCell'
import 'react-virtualized/styles.css';
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
    getAllAvailableFeatureHeaders,
    updateFeatureMienHeaders,
    getFeatureHeaderListForMien,
    updateFeaturePosition,
    expandFeatureInTree,
    cancelCandidateFeature,
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
        let selected_feature_ids = [node.id]
        if ( onSelectFeatures )  {
            onSelectFeatures(selected_feature_ids)
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
    
    renderCell = ({cellData, columnData, columnIndex, dataKey, isScrolling, rowData, rowIndex}) => {
        const { feature_items, header_list } = this.props
        const key = `feature_${columnIndex}_${rowIndex}`
        const item = feature_items[rowIndex]
        const feature = item.feature
        let content = null
        const header = header_list[columnIndex]
        const header_key = header.key

        if ( item.type === "candidate" ) {
            return  (
                <DivTableCell key={key}
                              extra_style={css`background-color:${theme.colours.new_item_background}`}>
                  { header_key === "name" && "Creating feature..." }
                  { header_key !== "name" && <span>&nbsp;</span> }
                </DivTableCell>
            )
        }
        
        switch(header_key) {
            case "number":
                content = (
                    <DivTableCell key={key} >
                      <div>{feature.number}</div>
                    </DivTableCell>
                )
                break
            case "name":
                content = (
                    <DivTableCell key={header_key} >
                      {feature.name}
                    </DivTableCell>
                )
                break
            default:
                console.error("Unknown header: " + header_key)
        }
        return content
    }

    getColumnWidth = ({index}) => {
        const { header_list } = this.props
        return header_list[index].maxWidth
    }

    renderFeatureIcons = (rowInfo) => {
        return [
            <div>I am an icon</div>,
        ]
    }

    render_tree() {

        const { is_mien_configurer_active, header_list, features_by_id,
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
                        //onChange={this.onUpdateTree}
                        onReorder={this.onReorder}
                        renderIcons={this.renderFeatureIcons}
                        onNodeSelected={this.onSelectedFeature}
                        onExpandCollapse={this.onExpandCollapse}
                        getAvailableHeaders={getAllAvailableFeatureHeaders}
                        getHeaderListForMien={getFeatureHeaderListForMien}
                        updateMienHeaders={updateFeatureMienHeaders}
                        header_list={header_list}
                        header_list_name="feature"
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
        const {list_key, header_list, onSelectFeatures} = props
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
            header_list: header_list,
            logged_in_user_id,
            onSelectFeatures
        }
    }
    return mapStateToProps
}

export default connect(makeMapStateToProps)(FeatureList)
