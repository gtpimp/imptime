import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'

class FileLabel extends Component {

    constructor(props) {
        super(props)
        this.onClickDownload = this.onClickDownload.bind(this)
    }

    onClickDownload() {
        const { download_url } = this.props
        window.open(download_url, '_blank')
    }
    
    render() {
        const { filename } = this.props
        return (
            <div onClick={this.onClickDownload}>{filename}</div>
        )
    }
}

function mapStateToProps(state, props) {

    const { value } = props
    const filename = value && value.name || "<none>"
    const download_url = value && value.download_url
    
    return {
        filename: filename,
        download_url: download_url
    }
}

export default connect(mapStateToProps)(FileLabel)

