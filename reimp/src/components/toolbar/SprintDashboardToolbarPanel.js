import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import '../../sass/toolbar-panel.css'
import ToolbarButton from './ToolbarButton'
import {
    PAGE_KEY__SPRINT_DASHBOARD_PAGE
} from '../../actions/ItemListKeyRegistry'

class SprintDashboardToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.onDeleteSprintClick = this.onDeleteSprintClick.bind(this)
        this.onOpenSprintClick = this.onOpenSprintClick.bind(this)
    }
    
    onDeleteSprintClick() {
        console.log('delete sprint clicked')
    }

    onOpenSprintClick() {
        const { project_id, sprint_id } = this.props
        browserHistory.push('/projects/'+project_id+'/sprints/'+sprint_id);
    }

    render() {
        const { sprint_id } = this.props
        return (
            <div className="toolbar-panel">
                { sprint_id &&
                  <ToolbarButton icon="subdirectory_arrow_left" onClick={this.onOpenSprintClick}/>
                }
                <ToolbarButton icon="delete" onClick={this.onDeleteSprintClick}/>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const sprint_objs = (state.sprint || {}).items_by_id || {}
    const page = state.page || {}
    const selected_sprint_ids = (page[PAGE_KEY__SPRINT_DASHBOARD_PAGE] || {}).sprint_ids || []
    const sprint = (selected_sprint_ids.length > 0 && sprint_objs[selected_sprint_ids[0]]) || null
    
    return {
        sprint: sprint,
        sprint_id: sprint.id,
        project_id: sprint.project_id
    }    
}


export default connect(mapStateToProps)(SprintDashboardToolbarPanel)
