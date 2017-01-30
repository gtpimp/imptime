import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import '../sass/toolbar-panel.css'
import ToolbarButton from './ToolbarButton'
import {
    PAGE_KEY__PROJECT_DASHBOARD_PAGE
} from '../actions/ItemListKeyRegistry'

class ProjectDashboardToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.onDeleteProjectClick = this.onDeleteProjectClick.bind(this)
        this.onOpenProjectClick = this.onOpenProjectClick.bind(this)
    }
    
    onDeleteProjectClick() {
        console.log('delete project clicked')
    }

    onOpenProjectClick() {
        const { project_id } = this.props
        browserHistory.push('/projects/'+project_id+'/sprints');
    }

    render() {
        return (
            <div className="toolbar-panel">
                Project:
                <ToolbarButton icon="subdirectory_arrow_left" onClick={this.onOpenProjectClick}/>
                <ToolbarButton icon="delete" onClick={this.onDeleteProjectClick}/>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const page = state.page || {}
    const selected_project_ids = (page[PAGE_KEY__PROJECT_DASHBOARD_PAGE] || {}).project_ids || []
    const project_id = (selected_project_ids.length > 0 && selected_project_ids[0]) || null
    
    return {
        project_id: project_id
    }
}


export default connect(mapStateToProps)(ProjectDashboardToolbarPanel)
