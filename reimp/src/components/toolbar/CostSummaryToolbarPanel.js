import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../../sass/toolbar-panel.css'
import ToolbarButton from './ToolbarButton'
import ReactTooltip from 'react-tooltip'
import {
    invalidateCostSummary
} from '../../actions/CostSummary'
import {
    invalidateTimeSummary
} from '../../actions/TimeSummary'
import {
    PAGE_KEY__SPRINTS_PAGE
} from '../../actions/ItemListKeyRegistry'
import { ensureSprintsLoaded, getSprint } from '../../actions/Sprints'
import {
    get_selected_sprint_ids
} from '../../actions/Page'

class CostSummaryToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.invalidateComponents = this.invalidateComponents.bind(this)
    }

    invalidateComponents() {
        const { dispatch, sprint_id } = this.props
        dispatch(invalidateCostSummary(sprint_id))
        dispatch(invalidateTimeSummary(sprint_id))
    }

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
              <ToolbarButton tooltip="Refresh" icon="refresh" onClick={this.invalidateComponents}/>
              <ReactTooltip place="bottom" type="info" />
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const selected_sprint_ids = get_selected_sprint_ids(state, PAGE_KEY__SPRINTS_PAGE)
    const sprint = (selected_sprint_ids && selected_sprint_ids.length > 0 && getSprint(state, selected_sprint_ids[0])) || {}
    const sprint_id = sprint.id || null

    return {
        sprint_id: sprint_id
    }
}


export default connect(mapStateToProps)(CostSummaryToolbarPanel)
