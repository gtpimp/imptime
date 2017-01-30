import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../sass/toolbar-panel.css'
import ToolbarButton from './ToolbarButton'

class ProjectToolbarPanel extends Component {

    onDeleteProjectClick() {
        console.log('delete project clicked')
    }

    onOpenProjectClick() {
        console.log('open project clicked')
    }
q
    render() {
        return (
            <div className="toolbar-panel">
                Project:
                <ToolbarButton icon="subdirectory_arrow_left" onClick={this.onOpenSprintClick}/>
                <ToolbarButton icon="delete" onClick={this.onDeleteProjectClick}/>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {}
}


export default connect(mapStateToProps)(ProjectToolbarPanel)
