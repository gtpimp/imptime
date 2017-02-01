import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import '../sass/toolbar-panel.css'
import {
    PAGE_KEY__PROJECTS_PAGE
} from '../actions/ItemListKeyRegistry'

class ProjectsToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.onNewProjectClick = this.onNewProjectClick.bind(this)
        this.onDashboardClick = this.onDashboardClick.bind(this)
    }
    
    onNewProjectClick() {
        console.log('new project clicked')
    }

    onDashboardClick() {
        const { selected_project_ids } = this.props
        const project_id = selected_project_ids[0]
        browserHistory.push('/projects/'+project_id);
    }

    render() {

        const { selected_project_ids } = this.props
        
        return (
            <div className="toolbar-panel">
                Projects
                <div className="button button--large button--primary" onClick={this.onNewProjectClick}>+ New Project</div>
                { selected_project_ids &&
                  <div>
                      <div className="button button--large button--primary" onClick={this.onDashboardClick}>+ Dashboard</div>
                  </div>
                }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const page = state.page || {}
    const selected_project_ids = (page[PAGE_KEY__PROJECTS_PAGE] || {}).project_ids
    
    return {
        selected_project_ids: selected_project_ids
    }
}


export default connect(mapStateToProps)(ProjectsToolbarPanel)
