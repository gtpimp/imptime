import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../sass/toolbar-panel.css'
class SprintsToolbarPanel extends Component {

    render() {
        return (
            <div className="toolbar-panel">
                Sprints:
                <div className="button button--large button--primary" onClick={this.onNewProjectClick}>+ New Sprint</div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {}
}


export default connect(mapStateToProps)(SprintsToolbarPanel)
