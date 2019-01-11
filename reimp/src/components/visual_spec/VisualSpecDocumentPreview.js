import React, {Component} from 'react'
import { css } from 'emotion'
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
        const {show, document, img_id, is_image, visual_spec_document} = this.props
        return (
            <div className={preview_container}>
              { !is_image &&
                <p>{visual_spec_document.name}</p>
              }
              { is_image &&
                <div id={img_id}
                     onClick={show}
                     className={preview_image}
                     style={{backgroundImage: `url('${document}'), url(${loading_gif})`}}>
                </div>
              }
            </div>
        )
    }
}

export default VisualSpecDocumentPreview;
