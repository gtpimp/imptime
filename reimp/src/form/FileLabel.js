import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { impfetch } from '../actions/lib'

class FileLabel extends Component {

    constructor(props) {
        super(props)
        this.onClickDownload = this.onClickDownload.bind(this)
        this.onClickPreview = this.onClickPreview.bind(this)
    }

    onClickDownload(event) {
        const { download_url } = this.props
        event.stopPropagation()
        window.open(download_url, '_blank')
    }

    onClickPreview(event) {
        const { preview_url } = this.props
        event.stopPropagation()
        window.open(preview_url, '_blank')
    }
    
    render() {
        const { filename } = this.props
        return (
            <div>
                <div onClick={this.onClickPreview}>
                    {filename}
                </div>
                <button onClick={this.onClickPreview}>
                    preview
                </button>
                <button onClick={this.onClickDownload}>
                    download
                </button>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { value } = props
    const filename = value && value.name || "<none>"
    const download_url = value && value.download_url
    const preview_url = value && value.preview_url
    
    return {
        filename: filename,
        download_url: download_url,
        preview_url: preview_url
    }
}

export default connect(mapStateToProps)(FileLabel)

