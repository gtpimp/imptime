import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../sass/toolbar-panel.css'

class ProjectsToolbarPanel extends Component {

    onNewProjectClick() {
        console.log('new project clicked')
    }

    render() {
        return (
            <div className="toolbar-panel">
                Projects
                <div className="button button--large button--primary" onClick={this.onNewProjectClick}>+ New Project</div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {}
}


export default connect(mapStateToProps)(ProjectsToolbarPanel)
