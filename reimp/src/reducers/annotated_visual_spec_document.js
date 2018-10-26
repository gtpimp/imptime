import { remove, map } from 'lodash'

export function update_visual_spec_annotation_within_annotated_vsd(entity_state, action) {
    const doc = Object.assign({}, entity_state.items_by_id[action.annotated_visual_spec_document_id])
    const annotations = Object.assign([], doc.annotations)
    map(action.annotation_ids, (annotation_id) => {
        let annotation = remove(annotations, (annotation) => annotation.id=annotation_id)[0]
        annotation = Object.assign({},
                                   annotation,
                                   action.params)
        annotations.push(annotation)
    })
    doc.annotations = annotations
    entity_state.items_by_id = Object.assign({}, entity_state.items_by_id,
                                             {[action.annotated_visual_spec_document_id]:doc})
    return entity_state
}

export function delete_visual_spec_annotation_within_annotated_vsd(entity_state, action) {
    const doc = Object.assign({}, entity_state.items_by_id[action.annotated_visual_spec_document_id])
    const annotations = Object.assign([], doc.annotations)
    map(action.annotation_ids, (annotation_id) => {
        remove(annotations, (annotation) => annotation.id=annotation_id)
    })
    doc.annotations = annotations
    entity_state.items_by_id[action.annotated_visual_spec_document_id] = doc
    return entity_state
}
