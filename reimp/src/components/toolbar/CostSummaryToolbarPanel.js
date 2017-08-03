import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../../sass/toolbar-panel.css'
import ToolbarButton from './ToolbarButton'
import ReactTooltip from 'react-tooltip'
import {
    invalidateCostSummary
} from '../actions/CostSummary'

class CostSummaryToolbarPanel extends Component {

    onSettingsClick() {
        console.log('settings clicked')
    }

    onDisableInfoClick() {
        console.log('disable info clicked')
    }

    onEnableInfoClick() {
        console.log('enable info clicked')
    }

    invalidateCostSummary() {
        const { dispatch, sprint_id } = this.props
        dispatch(invalidateCostSummary(sprint_id))
    }

    render() {
        return (
            <div className="toolbar-panel">
              <ToolbarButton tooltip="Refresh" icon="refresh" onClick={this.invalidateCostSummary}/>
              <ReactTooltip place="bottom" type="info" />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {}
}


export default connect(mapStateToProps)(CostSummaryToolbarPanel)
