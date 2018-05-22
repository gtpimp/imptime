import '../../sass/toolbar-panel.css'
import React, {Component} from 'react'
import ToolbarButton from './ToolbarButton'
import { connect } from 'react-redux'
import { invalidateBillableHoursStatement } from '../../actions/BillableHoursStatement'

class BillableHoursStatementToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.invalidateComponents = this.invalidateComponents.bind(this)
    }

    invalidateComponents() {
        const { dispatch } = this.props
        dispatch(invalidateBillableHoursStatement())
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


export default connect(mapStateToProps)(BillableHoursStatementToolbarPanel)
