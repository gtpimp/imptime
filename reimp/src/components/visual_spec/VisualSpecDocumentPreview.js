import React, {Component} from 'react'
import { css, cx } from 'emotion'
import classNames from 'classnames'
import {default_theme as theme} from '../../theme/default'
import VisualSpecAnnotationToolbar from './VisualSpecAnnotationToolbar'
import VisualSpecToolbar from './VisualSpecToolbar'
import {
    getAnnotatedVisualSpecDocument,
} from '../../actions/AnnotatedVisualSpecDocuments'
import loading_gif from "../../images/loading.gif"


const preview_container = css`display:flex;
                              justify-content:center;
                              width:100%;
                              height:95%;`

const preview_image = css`width:100%;
                          height:100%;
                          background-repeat: no-repeat;
                          background-size: contain, auto;
                          padding-top:15px;
                          background-position: center;`

class VisualSpecDocumentPreview extends Component {
    render() {
        const {show, hide, annotated_visual_spec_document_id,
               onLoad, document, img_id, visual_spec_document_image_loaded} = this.props
        console.log(document)
        return (
            <div className={preview_container}>
              <div id={img_id}
                   onClick={show}
                   className={preview_image}
                   style={{backgroundImage: `url('${document}'), url(${loading_gif})`}}>
              </div>
            </div>
        )
    }
}

export default VisualSpecDocumentPreview;
