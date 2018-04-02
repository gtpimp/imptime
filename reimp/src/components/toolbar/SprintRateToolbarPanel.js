import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import '../../sass/toolbar-panel.css'

class SprintRateToolbarPanel extends Component {

    render() {
        const {} = this.props
        return null
    }
}

function mapStateToProps(state, props) {
    return {
    }
}


export default connect(mapStateToProps)(SprintRateToolbarPanel)
