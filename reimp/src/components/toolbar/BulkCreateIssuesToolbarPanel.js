import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import '../../sass/toolbar-panel.css'
import ToolbarButton from './ToolbarButton'
import ReactTooltip from 'react-tooltip'

class BulkCreateIssuesToolbarPanel extends Component {

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


export default connect(mapStateToProps)(BulkCreateIssuesToolbarPanel)
