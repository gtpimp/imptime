import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'

class FileLabel extends Component {

    constructor(props) {
        super(props)
        this.onClickDownload = this.onClickDownload.bind(this)
        this.onClickPreview = this.onClickPreview.bind(this)
    }

    onClickDownload(event) {
        const { download_url } = this.props
        event.stopPropagation()
        window.open(download_url)
    }

    onClickPreview(event) {
        const { preview_url } = this.props
        event.stopPropagation()
        window.open(preview_url, '_blank')
    }
    
    render() {
        const { filename, exists, extra_buttons } = this.props
        return (
            <div className="file_label">
                <div onClick={this.onClickPreview}>
                    {filename}
                </div>

                { exists &&
                  <div>
                    <button onClick={this.onClickPreview}>
                      preview
                    </button>
                  </div>
                }
                { exists &&
                  <div>
                    <button onClick={this.onClicDownload}>
                      download
                    </button>
                  </div>
                }
                { map(extra_buttons, function(extra_button, index) {
                      return (
                          <div key={index}>
                            {extra_button}
                          </div>
                      )
                })}

            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { value, extra_buttons } = props
    const filename = (value && value.name) || "<none>"
    const download_url = value && value.download_url
    const preview_url = value && value.preview_url
    const exists = value && value.name
    
    return {
        exists: exists,
        filename: filename,
        download_url: download_url,
        preview_url: preview_url,
        extra_buttons: extra_buttons
    }
}

export default connect(mapStateToProps)(FileLabel)

