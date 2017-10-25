import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import '../../sass/toolbar-panel.css'
import ToolbarButton from '../toolbar/ToolbarButton'
import ReactTooltip from 'react-tooltip'
import { invalidateAllVisualSpecDocuments } from '../../actions/VisualSpecDocuments'
import { invalidateAllVisualSpecIssues } from '../../actions/VisualSpecIssues'
import VisualSpecIssue from './VisualSpecIssue'

class VisualSpecDocumentToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.invalidateComponents = this.invalidateComponents.bind(this)
    }

    invalidateComponents() {
        const { dispatch } = this.props
        dispatch(invalidateAllVisualSpecDocuments())
        dispatch(invalidateAllVisualSpecIssues())
    }

    render() {
        return (
            <div className="toolbar-panel">
              <ToolbarButton tooltip="Refresh" icon="refresh" onClick={this.invalidateComponents}/>
              <ToolbarButton>
                <div className="toolbar-panel__visual_spec">
                  <VisualSpecIssue name="New"/>
                </div>
              </ToolbarButton>
              <ReactTooltip place="bottom" type="info" />
            </div>
        )
    } 
}

function mapStateToProps(state, props) {
    const {} = props
    return {
    }
}


export default connect(mapStateToProps)(VisualSpecDocumentToolbarPanel)
