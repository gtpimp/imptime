import '../../sass/toolbar-panel.css'
import React, {Component} from 'react'
import ToolbarButton from './ToolbarButton'
import { PAGE_KEY__PROJECTS_PAGE } from '../../actions/ItemListKeyRegistry'
import { connect } from 'react-redux'
import { getProject } from '../../actions/Projects'
import { getPageSelectedEntities } from '../../actions/Page'
import { invalidateProjectStatement } from '../../actions/ProjectStatement'
import { invalidateTimeChart } from '../../actions/TimeChart'

class ProjectStatementToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.invalidateComponents = this.invalidateComponents.bind(this)
    }

    invalidateComponents() {
        const { dispatch, project_id } = this.props
        dispatch(invalidateProjectStatement(project_id))
        dispatch(invalidateTimeChart(project_id))
    }

    onSettingsClick() {
        console.log('settings clicked')
    }

    onDisableInfoClick() {
        console.log('disable info clicked')
    }

    onEnableInfoClick() {
        console.log('enable info clicked')
    }

    render() {
        return (
            <div className="toolbar-panel">
              <ToolbarButton tooltip="Refresh" icon="refresh" onClick={this.invalidateComponents}/>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const selected_project_ids = getPageSelectedEntities(state, PAGE_KEY__PROJECTS_PAGE).project_ids
    const project = (selected_project_ids && selected_project_ids.length > 0 && getProject(state, selected_project_ids[0])) || {}
    const project_id = project.id || null

    return {
        project_id: project_id
    }
}


export default connect(mapStateToProps)(ProjectStatementToolbarPanel)
