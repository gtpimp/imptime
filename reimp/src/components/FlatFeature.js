import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map, size, slice } from 'lodash'
import { cx, css } from 'emotion'
import { default_theme as theme } from '../theme/default'
import 'react-virtualized/styles.css';
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
        const { feature } = this.props
        return (
            <div className={css`display: flex; flex-wrap: wrap; margin-bottom: 20px;`}>
              <VisualSpecDocumentGallery annotated_visual_spec_document_ids={feature.annotated_visual_spec_document_ids}
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
        if ( ! feature ) {
            return null
        }
        
        const is_root_element = size(parent_features) === 0
        if ( is_root_element ) {
            return null
        }
        
        const is_top_level = size(parent_features) === 1
        const is_empty = size(feature.testables) === 0 && size(feature.description) === 0 && size(feature.annotated_visual_spec_document_ids) === 0
        if ( !is_top_level && is_empty ) {
            return null
        }
        const autoForwardedInnerRef = this.props.innerRef
        
        return (
            <div ref={autoForwardedInnerRef}
                 className={css`margin-bottom: 50px; page-break-inside: avoid;`}>
              <div>{this.renderFeatureDescription()}</div>
              <div>{this.renderFeatureImages()}</div>
              <div>{this.renderFeatureTestables()}</div>
            </div>
        )
    }
}

const mapStateToProps = (state, props) => {
    const { feature, parent_features } = props
    const annotated_visual_spec_document_ids = feature && feature.annotated_visual_spec_document_ids

    return {
        parent_features, 
        feature,
        annotated_visual_spec_document_ids
    }
}

const ConnectedFlatFeature = connect(mapStateToProps)(FlatFeature)

export default React.forwardRef((props, ref) => (
    <ConnectedFlatFeature {...props} innerRef={ref} />
))
