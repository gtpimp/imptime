import '../../sass/toolbar-panel.css'
import React, {Component} from 'react'
import { connect } from 'react-redux'
import { recalculateNudges, isRecalculatingNudges } from '../../actions/Nudges'

class ScheduleItemToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.onRecalculateNudgesClicked = this.onRecalculateNudgesClicked.bind(this)
    }

    onRecalculateNudgesClicked() {
        const { dispatch } = this.props
        dispatch(recalculateNudges())
    }

    render() {
        const { is_recalculating_nudges } = this.props
        return (
            <div className="toolbar-panel">
              <div className="button toolbar-button--small button--large button--primary"
                   onClick={this.onRecalculateNudgesClicked}>
                Recalculate
                { is_recalculating_nudges &&
                  <div className="icon--loading"/>
                }
              </div>
            </div>
        )        
    }
}

function mapStateToProps(state, props) {
    const is_recalculating_nudges = isRecalculatingNudges(state)
    
    return {
        is_recalculating_nudges
    }
}


export default connect(mapStateToProps)(ScheduleItemToolbarPanel)
