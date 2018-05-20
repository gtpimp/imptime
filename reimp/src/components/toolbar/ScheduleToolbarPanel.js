import '../../sass/toolbar-panel.css'
import {Component} from 'react'
import { connect } from 'react-redux'
import { recalculateSchedules } from '../../actions/Schedules'

class ScheduleToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.onRecalculateClicked = this.onRecalculateClicked.bind(this)
    }

    onRecalculateClicked() {
        const { dispatch } = this.props
        dispatch(recalculateSchedules())
    }

    render() {
        return null
    }
}

function mapStateToProps(state, props) {
    return {
    }
}


export default connect(mapStateToProps)(ScheduleToolbarPanel)
