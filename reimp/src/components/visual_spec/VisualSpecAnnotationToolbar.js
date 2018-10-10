import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import VisualSpecAnnotation from './VisualSpecAnnotation'
import { css } from 'emotion'
import {default_theme as theme} from '../../theme/default'

export const ANNOTATION_SHAPES = [ "circle", "square", "arrow" ]

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
                       annotation_size_px={25}
                       tooltips_enabled={false}
                   />
               ))}
            </div>
        )
    }
    
}

function mapStateToProps(state, props) {
    return {}
}


export default connect(mapStateToProps)(VisualSpecAnnotationToolbar)
