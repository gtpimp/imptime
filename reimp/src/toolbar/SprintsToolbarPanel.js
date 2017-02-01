import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../sass/toolbar-panel.css'
import {browserHistory} from 'react-router'
import {
    PAGE_KEY__SPRINTS_PAGE
} from '../actions/ItemListKeyRegistry'

class SprintsToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.onNewProjectClick = this.onNewProjectClick.bind(this)
        this.onDashboardClick = this.onDashboardClick.bind(this)
    }
    
    onNewProjectClick() {
        console.log('new project clicked')
    }

    onDashboardClick() {
        const { sprint } = this.props
        browserHistory.push('/projects/'+sprint.project_id+'/sprints/'+sprint.id);
    }
    
    render() {

        const { sprint } = this.props
        
        return (
            <div className="toolbar-panel">
                Sprints:
                <div className="button button--large button--primary" onClick={this.onNewProjectClick}>
                    + New Sprint
                </div>
                { sprint &&
                  <div>
                      <div className="button button--large button--primary" onClick={this.onDashboardClick}>
                          + Dashboard
                      </div>
                  </div>
                }
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const sprint_objs = (state.sprint || {}).items_by_id || {}
    const page = state.page || {}
    const selected_sprint_ids = (page[PAGE_KEY__SPRINTS_PAGE] || {}).sprint_ids || []
    const sprint = (selected_sprint_ids.length > 0 && sprint_objs[selected_sprint_ids[0]]) || null
    
    return {
        sprint: sprint
    }
    
    return {}
}


export default connect(mapStateToProps)(SprintsToolbarPanel)
