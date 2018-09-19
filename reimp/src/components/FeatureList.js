import React, {Component} from 'react'
import { concat, indexOf, union, difference, includes } from 'lodash'
import {connect} from 'react-redux'
import { ensureProjectsLoaded, getProject } from '../actions/Projects'
import { logged_in_user } from '../actions/Auth'
import CommonTable from './CommonTable'
import 'react-virtualized/styles.css';
import {
    makeSelFeatureIds,
    makeSelFeaturesById,
    makeSelInvalidatedFeatureIds,
    makeSelLoadingFeatureIds,
    makeSelSelectedFeatures,
    makeSelSavingFeatureIds, 
    makeSelFeatures,
    makeSelFeatureObjectsToRender
} from '../selectors/FeatureListSelectors'
import {
    initList,
    invalidateList,
    collapse_list,
    expand_list,
    getVisibleItemIds,
    getSelectedItemIds,
    getHighlightedItemIds,
    getLastUpdated,
    isLoading,
    getListFilter
} from '../actions/ItemList'
import {
    invalidateAllFeatures,
    fetchFeaturesIfNeeded,
    reorderFeature,
    cancelCandidateFeature,
    getCandidateFeature,
    getAllAvailableFeatureHeaders,
    updateFeatureMienHeaders,
    getFeatureHeaderListForMien,
    deleteFeatures
} from '../actions/Features'

class FeatureList extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
        this.onChangePage = this.onChangePage.bind(this)
        this.onClickedFeature = this.onClickedFeature.bind(this)
        this.reorderFeature = this.reorderFeature.bind(this)
        this.onDeleteFeature = this.onDeleteFeature.bind(this)
    }

    componentDidMount() {
        const {dispatch, list_key, project_id} = this.props
        if (project_id) {
            dispatch(initList(list_key))
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

    handleShortcuts(action, event) {
        const { dispatch } = this.props
        switch(action) {
            case 'NEW':
                //alert("create new feature")
                break
            case 'CANCEL':
                dispatch(cancelCandidateFeature())
                break
            default:
                break
        }
    }

    onDeleteFeature(feature_id) {
        const {visible_item_ids} = this.props
        const {onSelectFeatures} = this.props
        const feature_index = indexOf(visible_item_ids, feature_id)
        let next_index = feature_index - 1
        if ( next_index < 0 ) {
            next_index = visible_item_ids.length-1
        }
        onSelectFeatures([visible_item_ids[next_index]])
    }

    onCollapse() {
        const {dispatch, list_key} = this.props
        dispatch(collapse_list(list_key))
    }

    onExpand() {
        const {dispatch, list_key} = this.props
        dispatch(expand_list(list_key))
    }

    onClickedFeature(event, feature_id) {
        const {dispatch, onSelectFeatures, selected_ids} = this.props
        if ( event ) {
            event.stopPropagation()
        }

        let selected_feature_ids = []
        if (event.ctrlKey || event.metaKey) {
            if (includes(selected_ids, feature_id)) {
                selected_feature_ids = difference(selected_ids, [feature_id])
            } else {
                selected_feature_ids = union(selected_ids, [feature_id])
            }
        } else if (event.shiftKey) {
            selected_feature_ids = concat(selected_ids, this.findFeaturesFromHereToAlreadySelected(feature_id))
        }
        if ( onSelectFeatures ) {
            onSelectFeatures(selected_feature_ids)
        }
        dispatch(cancelCandidateFeature())
    }

    findFeaturesFromHereToAlreadySelected(target_feature_id) {
        window.alert("Not implemented yet")
        return [target_feature_id]
    }

    onChangePage() {
        const {dispatch, list_key} = this.props
        dispatch(invalidateList(list_key))
        dispatch(fetchFeaturesIfNeeded(list_key))
    }

    onRefresh(event) {
        const {dispatch, feature_ids, list_key} = this.props
        dispatch(invalidateList(list_key))
        dispatch(invalidateAllFeatures(feature_ids))
        dispatch(cancelCandidateFeature())
        dispatch(fetchFeaturesIfNeeded(list_key))
        if (event) {
            event.stopPropagation()
        }
    }

    onDeleteFeature = (event, feature) => {
        const { dispatch, onDelete } = this.props
        event.stopPropagation()

        if ( feature.actual_hours > 0 ) {
            window.alert("This feature has time against it and so can't be deleted")
            return
        }
        
        if ( ! window.confirm( "Delete feature " + feature.number + " - " + feature.subject + "?") ) {
            return
        }
        dispatch(deleteFeatures([feature.id]))
        if ( onDelete ) {
            onDelete(feature.id)
        }
    }

    reorderFeature(index_of_row_being_moved, index_of_destination) {
        const {dispatch, list_key, feature_items} = this.props

        // get feature being moved
        const moving_feature_id = feature_items[index_of_row_being_moved].id
        if ( ! moving_feature_id ) {
            return
        }
        let selected_ids = this.props.selected_ids || []
        if ( ! includes(selected_ids, moving_feature_id) ) {
            selected_ids = [moving_feature_id]
        }

        // get place to move it
        let move_after_feature_id
        if ( index_of_row_being_moved > index_of_destination ) {
            move_after_feature_id = (index_of_destination>0 && feature_items[index_of_destination-1].id) || null
        } else {
            move_after_feature_id = feature_items[index_of_destination].id || null
        }

        const target_feature_id = move_after_feature_id

        dispatch(reorderFeature(selected_ids, target_feature_id, list_key,
                              index_of_destination,
                              function () {
                                  dispatch(invalidateList(list_key))
                                  dispatch(fetchFeaturesIfNeeded(list_key))
                              }))
    }

    render_candidate_feature() {

        const {list_key} = this.props

        return (
            <div key={list_key + ".candidate_feature"}
                 className="div-table__row feature_list__candidate_feature">
              <div className="div-table__cell" colSpan="20">
                Creating new feature here
              </div>
            </div>
        )
    }

    renderCell = ({cellData, columnData, columnIndex, dataKey, isScrolling, rowData, rowIndex}) => {
        const key = `feature_${columnIndex}_${rowIndex}`
        
        return (
            <div key={key}>
              yeah
            </div>
        )
    }

    getColumnWidth = ({index}) => {
        const { header_list } = this.props
        return header_list[index].maxWidth
    }

    render_tree() {

        const { is_mien_configurer_active, header_list, is_visible, feature_items, selected_ids } = this.props

        if (!is_visible) {
            return (<div></div>)
        }

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
              <CommonTable getAvailableHeaders={getAllAvailableFeatureHeaders}
                           getHeaderListForMien={getFeatureHeaderListForMien}
                           onRowSelected={this.onClickedFeature}
                           onRowReordered={this.reorderFeature}
                           updateMienHeaders={updateFeatureMienHeaders}
                           header_list_name="feature"
                           items={feature_items}
                           selected_item_ids={selected_ids}
                           header_list={header_list}
                           renderCell={this.renderCell}
              />
        )
    }

    render() {

        const {is_visible} = this.props

        if (!is_visible) {
            return (<div></div>)
        }

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
    const mapStateToProps = (state, props) => {
        const {list_key, feature_header_list} = props
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

        return {
            list_key: list_key,
            visible_item_ids,
            project_id: project_id,
            project,
            features: items,
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
            is_visible: project_id || (visible_item_ids && visible_item_ids.length > 0) || false,
            candidate_feature: candidate_feature,
            is_creating_feature: is_creating_feature,
            header_list: feature_header_list,
            logged_in_user_id
        }
    }
    return mapStateToProps
}

export default connect(makeMapStateToProps)(FeatureList)
