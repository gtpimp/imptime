import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map, size, slice } from 'lodash'
import { cx, css } from 'emotion'
import { default_theme as theme } from '../theme/default'
import 'react-virtualized/styles.css';
import {
    ensureVisualSpecFeatureAnnotationsLoaded,
    createVisualSpecFeatureAnnotation,
    updateVisualSpecFeatureAnnotation,
    deleteVisualSpecFeatureAnnotation
} from '../actions/VisualSpecFeatureAnnotations'
import {
    makeSelFeatureAnnotationsByDocId
} from '../selectors/FeatureSelectors'
import Testable from './Testable'
import VisualSpecDocumentGallery from './visual_spec/VisualSpecDocumentGallery'
import RenderedMarkdown from './RenderedMarkdown'

class FlatFeature extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, visual_spec_document_ids } = props
        if ( visual_spec_document_ids ) {
            dispatch(ensureVisualSpecFeatureAnnotationsLoaded(visual_spec_document_ids))
        }
    }

    onCreateAnnotation = (visual_spec_document_id, params) => {
        const { dispatch, feature } = this.props
        dispatch(createVisualSpecFeatureAnnotation(visual_spec_document_id, feature.id, params))
    }
    
    onUpdateAnnotation = (visual_spec_document_id, visual_spec_annotation_ids, params) => {
        const { dispatch, feature } = this.props
        dispatch(updateVisualSpecFeatureAnnotation(visual_spec_document_id, feature.id,
                                                   visual_spec_annotation_ids, params))    }
    
    onDeleteAnnotation = (visual_spec_annotation_id) => {
        const { dispatch } = this.props
        dispatch(deleteVisualSpecFeatureAnnotation(visual_spec_annotation_id))
    }

    renderFeatureDescription() {
        const { parent_features, feature } = this.props
        return (
            <div className={cx("text-component--readonly text-component--description",
                               css`background-color: ${theme.colours.sub_nav_bar};
                                   border-top: 1px solid ${theme.colours.border_strong}`)}>
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

    renderFeatureImages() {
        const { feature, feature_annotations_by_doc_id } = this.props
        return (
            <div className={css`display: flex; flex-wrap: wrap; margin-bottom: 20px;`}>
              <VisualSpecDocumentGallery visual_spec_document_ids={feature.visual_spec_document_ids}
                                         onCreateAnnotation={this.onCreateAnnotation}
                                         onUpdateAnnotation={this.onUpdateAnnotation}
                                         onDeleteAnnotation={this.onDeleteAnnotation}
                                         visual_spec_annotations_by_doc_id={feature_annotations_by_doc_id}
                                         feature_id={feature.id}
                                         render_quality="hires"
                                         image_class="visual_spec_document_gallery__image--large_preview"
                                         allow_edit={false} />
            </div>
        )
    }

    renderFeatureTestables() {
        const { feature } = this.props
        return (
            <div className={css`display: flex; flex-wrap: wrap;`}>
              { map(feature.testables, (testable) =>
                  <div key={`feature_testable_${testable.id}`} className={css`max-width:25%; margin-left: 30px; margin-right: 30px;`}>
                    <Testable key={`testable_${testable.id}`} testable={testable} />
                  </div>
                ) }
            </div>
        )
    }    

    render() {
        const { feature, parent_features } = this.props
        const is_root_element = size(parent_features) === 1
        if ( ! feature ) {
            return null
        }
        if ( is_root_element ) {
            return null
        }
        const is_empty = size(feature.testables) === 0 && size(feature.description) === 0 && size(feature.visual_spec_document_ids) === 0
        if ( is_empty ) {
            return null
        }
        
        return (
            <div className={css`margin-bottom: 50px;`}>
              <div>{this.renderFeatureDescription()}</div>
              <div>{this.renderFeatureImages()}</div>
              <div>{this.renderFeatureTestables()}</div>
            </div>
        )
    }
}

const makeMapStateToProps = () => {
    const selFeatureAnnotationsByDocId = makeSelFeatureAnnotationsByDocId()
    const mapStateToProps = (state, props) => {
        const { feature, parent_features } = props
        const visual_spec_document_ids = feature && feature.visual_spec_document_ids
        const feature_annotations_by_doc_id = selFeatureAnnotationsByDocId(state, props)

        return {
            parent_features, 
            feature,
            visual_spec_document_ids,
            feature_annotations_by_doc_id
        }
    }
    return mapStateToProps
}

export default connect(makeMapStateToProps)(FlatFeature)
