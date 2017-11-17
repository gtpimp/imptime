import '../../sass/toolbar-panel.css'
import React, {Component} from 'react'
import ReactTooltip from 'react-tooltip'
import ToolbarButton from './ToolbarButton'
import { connect } from 'react-redux'
import { recalculateNudges } from '../../actions/Nudges'

    class NudgeToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.onRecalculateClicked = this.onRecalculateClicked.bind(this) 
    }

    onRecalculateClicked() {
        const { dispatch } = this.props
        dispatch(recalculateNudges())
    }

    render() {
        return (
            <div className="toolbar-panel">
              <ToolbarButton tooltip="Refresh" icon="refresh" onClick={this.onRecalculateClicked}/>
              <ReactTooltip place="bottom" type="info" />
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    return {
    }
}


export default connect(mapStateToProps)(NudgeToolbarPanel)
