import { createSelector } from 'reselect'
import { ENTITY_KEY__VISUAL_SPEC_FEATURE_ANNOTATION } from '../actions/ItemListKeyRegistry'
import { get, map, keys } from 'lodash'

const selGetFeature = (state, props) => {
    return get(props, "feature")
}

const selGetAnnotationsById = (state, props) => {
    return get(state, ["item", ENTITY_KEY__VISUAL_SPEC_FEATURE_ANNOTATION, "items_by_id"], null)
}

export const makeSelFeatureAnnotationsByDocId = () => {
    return createSelector(
        [ selGetFeature, selGetAnnotationsById ],
        ( feature, annotations_by_id ) => {
            const { visual_spec_annotation_ids_by_doc_id } = feature
            const d = {}
            map(keys(visual_spec_annotation_ids_by_doc_id), (doc_id) => {
                if ( ! d[doc_id] ) {
                    d[doc_id] = []
                }
                map(visual_spec_annotation_ids_by_doc_id[doc_id], (annotation_id) => {
                    d[doc_id].push(annotations_by_id[annotation_id])
                })
            })
            return d
        }
    )
}
