import React, {Component} from 'react'
import {connect} from 'react-redux'
import VisualSpecAnnotation from './VisualSpecAnnotation'
import ANNOTATION_SHAPES from './VisualSpecDocumentGalleryImage'
import { css } from 'emotion'
import {default_theme as theme} from '../../theme/default'
import {DragSource, DropTarget} from 'react-dnd';
import {DndTypes} from '../../actions/Dnd'

class VisualSpecAnnotationToolbar extends Component {

    render() {
        return (
            <div className={css`display: flex; 
                                cursor: pointer; 
                                margin-right: ${theme.spacing.horizontal_section_gap}`} >
              {map(ANNOTATION_SHAPES, (shape) => (
                   <VisualSpecAnnotation
                       key={shape}
                       visual_spec_annotation={null}
                       default_shape={shape}
                       container_img_element_unique_id={null}
                       annotation_size_px={25}
                       tooltips_enabled={false}
                       onUpdate={this.updateVisualSpecAnnotation}
                       onCreate={this.createVisualSpecAnnotation}
                   />
               ))}
            </div>
        )
    }
    
}


export default withRouter(connect(mapStateToProps)(DragSource(DndTypes.VISUAL_SPEC_ANNOTATION, headingSource, collect)(DropTarget(DndTypes.VISUAL_SPEC_ANNOTATION, headingTarget, collectDrop)(VisualSpecAnnotationToolbar))))
