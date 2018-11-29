import React, {Component} from 'react'
import { css, cx } from 'emotion'
import classNames from 'classnames'
import {default_theme as theme} from '../../theme/default'
import VisualSpecAnnotationToolbar from './VisualSpecAnnotationToolbar'
import VisualSpecToolbar from './VisualSpecToolbar'

const preview_toolbar = css`display:flex;
                            align-items:center;`

const preview_container = css`display:flex;
                              justify-content:center;`

class VisualSpecDocumentPreview extends Component {
    render() {
        const {show, hide, annotated_visual_spec_document_id, onLoad, document, img_id} = this.props
        
        return (
            <div>
              <div className={preview_container}>
                <img id={img_id}
                     src={document}
                     onLoad={onLoad}
                     alt=""
                     onClick={show}
                     style={{maxWidth:'100%', paddingTop:'15px'}}
                />
              </div>
            </div>
        )
    }
}

export default VisualSpecDocumentPreview;
