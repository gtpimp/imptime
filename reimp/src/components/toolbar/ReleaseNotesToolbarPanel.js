import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../../sass/toolbar-panel.css'

class ReleaseNotesToolbarPanel extends Component {

    render() {
        return (
            <div className="toolbar-panel">
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {
    }
}


export default connect(mapStateToProps)(ReleaseNotesToolbarPanel)
