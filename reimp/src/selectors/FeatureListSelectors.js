import { createSelector } from 'reselect'
import {
    ENTITY_KEY__FEATURE,
} from '../actions/ItemListKeyRegistry'
import { each, union, intersection, get, compact, map, size,
         includes, filter, keyBy, values, sortBy } from 'lodash'
import { getTreeFromFlatData } from 'react-sortable-tree'

const selGetVisibleFeatureIds = (state, props) => {
    return get(state, ["item_list", props.list_key, "visible_item_ids"], null)
}

const selGetAllFeaturesById = (state, props) => {
    return get(state, ["item", ENTITY_KEY__FEATURE, "items_by_id"], null)
}

const selGetInvalidatedFeatureIds = (state, props) => {
    return get(state, ["item", ENTITY_KEY__FEATURE, "invalidated_item_ids"], null)
}

const selGetSavingFeatureIds = (state, props) => {
    return get(state, ["item", ENTITY_KEY__FEATURE, "saving_item_ids"], null)
}

const selGetLoadingFeatureIds = (state, props) => {
    return get(state, ["item", ENTITY_KEY__FEATURE, "loading_item_ids"], null)
}

const selGetSelectedFeatureIds = (state, props) => {
    return get(state, ["item_list", props.list_key, "selected_ids"], null)
}

const selGetCandidateFeature = (state, props) => {
    return get(state, ["item", ENTITY_KEY__FEATURE, "candidate_item"], null)
}

const selGetTransientFeatureValuesById = (state, props) => {
    return get(state, ["item", ENTITY_KEY__FEATURE, "transient_values_by_id"], null)
}

const helperGetFilteredFeaturesById = (all_features_by_id, filter_feature_ids) => {
    if ( ! all_features_by_id ) {
        return null
    }
    const features = map(filter_feature_ids, (feature_id) => all_features_by_id[feature_id])
    return keyBy(features, 'id')
}

const helperGetVisibleFeaturesById = (all_features_by_id, visible_feature_ids) => {
    return helperGetFilteredFeaturesById(all_features_by_id, visible_feature_ids)
}

const helperGetFeatureFeatureIds = (all_features_by_id, visible_feature_ids) => {
    const visible_features_by_id = helperGetVisibleFeaturesById(all_features_by_id, visible_feature_ids)
    return compact(map(values(visible_features_by_id), 'parent_group_id'))
}

const helperMergeFeatureAndFeatureIds = (all_features_by_id, visible_feature_ids) => {
    const feature_feature_ids = helperGetFeatureFeatureIds(all_features_by_id, visible_feature_ids)
    return union(visible_feature_ids, feature_feature_ids)
}

export const makeSelFeatureFeatureIds = () => {
    return createSelector (
        [ selGetAllFeaturesById, selGetVisibleFeatureIds ],
        (all_features_by_id, visible_feature_ids) => {
            return helperGetFeatureFeatureIds(all_features_by_id, visible_feature_ids)
        }
    )
}

export const makeSelFeatureFeaturesById = () => {
    return createSelector (
        [ selGetAllFeaturesById, selGetVisibleFeatureIds ],
        (all_features_by_id, visible_feature_ids) => {
            const feature_feature_ids = helperGetFeatureFeatureIds(all_features_by_id, visible_feature_ids)
            return helperGetFilteredFeaturesById(all_features_by_id, feature_feature_ids)
        }
    )
}

export const makeSelFeatureIds = () => {
    return createSelector(
        [ selGetAllFeaturesById ],
        ( all_features_by_id ) => {
            return map(all_features_by_id, 'id')
        }
    )
}

export const makeSelFeaturesById = () => {
    return createSelector(
        [ selGetAllFeaturesById, selGetVisibleFeatureIds ],
        ( all_features_by_id, visible_feature_ids  ) => {
            const features = all_features_by_id && visible_feature_ids && compact(map(visible_feature_ids, function(feature_id) {
                return all_features_by_id[feature_id] || {
                    'id': feature_id,
                    'loaded': false
                }
            }))
            return keyBy(features, 'id')
        }
    )
}

export const makeSelInvalidatedFeatureIds = () => {
    return createSelector(
        [ selGetAllFeaturesById, selGetInvalidatedFeatureIds, selGetVisibleFeatureIds ],
        ( all_features_by_id, invalidated_feature_ids, visible_feature_ids ) => {
            const merged_feature_ids = helperMergeFeatureAndFeatureIds(all_features_by_id, visible_feature_ids)
            return intersection(merged_feature_ids, invalidated_feature_ids)
        }
    )
}

export const makeSelSavingFeatureIds = () => {
    return createSelector(
        [ selGetAllFeaturesById, selGetSavingFeatureIds, selGetVisibleFeatureIds ],
        ( all_features_by_id, saving_feature_ids, visible_feature_ids ) => {
            const merged_feature_ids = helperMergeFeatureAndFeatureIds(all_features_by_id, visible_feature_ids)
            return intersection(merged_feature_ids, saving_feature_ids)
        }
    )
}

export const makeSelLoadingFeatureIds = () => {
    return createSelector(
        [ selGetAllFeaturesById, selGetLoadingFeatureIds, selGetVisibleFeatureIds ],
        ( all_features_by_id, loading_feature_ids, visible_feature_ids ) => {
            const merged_feature_ids = helperMergeFeatureAndFeatureIds(all_features_by_id, visible_feature_ids)
            return filter(values(all_features_by_id), (feature) => { feature.loaded === false && includes(merged_feature_ids, feature.id) })
        }
    )
}

export const makeSelSelectedFeatures = () => {
    return createSelector(
        [ selGetAllFeaturesById, selGetSelectedFeatureIds ],
        ( all_features_by_id, selected_feature_ids ) => {
            if ( ! all_features_by_id ) {
                return []
            }
            return map(selected_feature_ids, function (feature_id) {
                return (all_features_by_id && all_features_by_id[feature_id]) || {
                    'id': feature_id,
                    'loaded': false
                }
            })
        }
    )
}

export const makeSelFeatures = () => {
    return createSelector(
        [ selGetAllFeaturesById, selGetVisibleFeatureIds ],
        ( all_features_by_id, visible_feature_ids ) => {
            return map(visible_feature_ids, function (visible_feature_id) {
                return (all_features_by_id && all_features_by_id[visible_feature_id]) || {
                    'id': visible_feature_id,
                    'loaded': false
                }
            })
        }
    )
}

export const makeSelFeatureObjectsToRender = () => {
    
    return createSelector(
        [ selGetAllFeaturesById, selGetVisibleFeatureIds, selGetCandidateFeature ],
        ( all_features_by_id, visible_feature_ids, candidate_feature ) => {

            if ( ! all_features_by_id ) {
                return []
            }
            const is_creating_feature = candidate_feature || false
            const features_to_render = []
            each(visible_feature_ids, function(feature_id, index) {
                const feature = all_features_by_id[feature_id] || {}
                if (is_creating_feature && index === 0 && !candidate_feature.feature_id_before) {
                    features_to_render.push({ feature: null, type: "candidate", id: null })
                }

                features_to_render.push( {feature:feature, type:"feature", id: feature.id} )

                if (is_creating_feature && candidate_feature.feature_id_before === feature.id) {
                    features_to_render.push( {feature:null, type:"candidate", id: null} )
                }
            })

            return features_to_render
        }
    )
}

const helperCreateStructuredTree = (all_features_by_id, selected_feature_ids, transient_values_by_id) => {
    
    const MAX_CHARS_FOR_SUBTITLE = 100
    if ( ! all_features_by_id ) {
        return []
    }
    map(all_features_by_id, function(feature) {
        feature.selected = includes(selected_feature_ids, feature.id)
        feature.title = `${feature.name}_id${feature.id}__order${feature.order}__selected${feature.selected}`
        feature.title = feature.name
        feature.subtitle = (feature.description || "").substring(0, MAX_CHARS_FOR_SUBTITLE)
        feature.expanded = get(transient_values_by_id, [feature.id, "expanded"], false)
    })
    let tree = getTreeFromFlatData({flatData: values(all_features_by_id),
                                    getKey: (node) => node.id,
                                    getParentKey: (node) => node.parent_id,
                                    rootKey: null})
    tree = recursivelySortTree(tree)
    return tree
}

export const makeSelFeaturesAsStructuredTree = () => {
    return createSelector(
        [ selGetAllFeaturesById, selGetSelectedFeatureIds, selGetTransientFeatureValuesById ],
        ( all_features_by_id, selected_feature_ids, transient_values_by_id ) => {
            const tree = helperCreateStructuredTree(all_features_by_id, selected_feature_ids, transient_values_by_id)
            return tree
        }
    )
}

export const makeSelTopLevelFeaturesList = () => {
    return createSelector(
        [ selGetAllFeaturesById, selGetSelectedFeatureIds, selGetTransientFeatureValuesById ],
        ( all_features_by_id, selected_feature_ids, transient_values_by_id ) => {

            const tree = helperCreateStructuredTree(all_features_by_id, selected_feature_ids, transient_values_by_id)
            if ( size(tree) === 0 ) {
                return []
            }
            const root = tree[0]
            return root.children
        }
    )
}

function recursivelySortTree(nodes) {
    nodes = sortBy(nodes, (node) => (node && node.order) || 0)
    map(nodes, (node) => {
        node.children = recursivelySortTree(node.children)
    })
    return nodes
}

