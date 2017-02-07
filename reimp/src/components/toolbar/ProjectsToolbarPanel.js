import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import '../../sass/toolbar-panel.css'
import {
    PAGE_KEY__PROJECTS_PAGE
} from '../../actions/ItemListKeyRegistry'
import {
    startCandidateProject
} from '../../actions/Projects.js'

import { ensureProjectsLoaded, getProject } from '../../actions/Projects'
import {
    get_selected_project_ids
} from '../../actions/Page'

class ProjectsToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.onNewProjectClick = this.onNewProjectClick.bind(this)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps() {
        this.refresh()
    }

    refresh() {
        const {dispatch, project_ids} = this.props
        dispatch(ensureProjectsLoaded(project_ids))
    }
    
    onNewProjectClick() {
        const { dispatch } = this.props
        dispatch(startCandidateProject())
    }

    render() {

        const { selected_project_ids } = this.props
        
        return (
            <div className="toolbar-panel">
                <div className="button button--large button--primary" onClick={this.onNewProjectClick}>+ New Project</div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const selected_project_ids = get_selected_project_ids(state, PAGE_KEY__PROJECTS_PAGE)
    const project = (selected_project_ids && selected_project_ids.length > 0 && getProject(state, selected_project_ids[0])) || {}
    
    return {
        selected_project_ids: selected_project_ids,
        project_id: project.id
    }
}


export default connect(mapStateToProps)(ProjectsToolbarPanel)
