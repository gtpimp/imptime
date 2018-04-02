import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import '../../sass/toolbar-panel.css'
import ToolbarButton from './ToolbarButton'
import ReactTooltip from 'react-tooltip'
import { invalidateAllUserTimesheets } from '../../actions/UserTimesheets'
import { LIST_KEY__USER_TIMESHEET_LIST } from '../../actions/ItemListKeyRegistry'
import { invalidateList } from '../../actions/ItemList'

class UserTimesheetsToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.invalidateComponents = this.invalidateComponents.bind(this)
    }

    invalidateComponents() {
        const { dispatch, project_id } = this.props
        dispatch(invalidateAllUserTimesheets())
        dispatch(invalidateList(LIST_KEY__USER_TIMESHEET_LIST))
    }

    render() {
        return (
            <div className="toolbar-panel">
              <ToolbarButton tooltip="Refresh" icon="refresh" onClick={this.invalidateComponents}/>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {
    }
}


export default connect(mapStateToProps)(UserTimesheetsToolbarPanel)
