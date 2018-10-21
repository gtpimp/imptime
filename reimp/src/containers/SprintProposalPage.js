import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { setSprintBreadcrumbsHelper, setBreadcrumbs } from '../actions/Breadcrumbs'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'
import { PAGE_KEY__SPRINT_PROPOSAL_PAGE } from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
    setBrowserTitle
} from '../actions/Page'
import SprintProposal from '../components/SprintProposal'

class SprintProposalPage extends Component {

    componentDidMount() {
        const {sprint_id, project_id, dispatch} = this.props
        dispatch(set_toolbars(PAGE_KEY__SPRINT_PROPOSAL_PAGE, ['sprint-proposal']))
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        const { sprint_id, project_id, dispatch } = this.props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        
        if ( (new_props.project && (!this.props.project || new_props.project.id !== this.props.project.id)) ||
             (new_props.sprint && (!this.props.sprint || new_props.sprint.id !== this.props.sprint.id)) ) {
            this.refresh(new_props)
        }
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch,
                project, project_id,
                sprint, sprint_id } = props

        if ( project && sprint ) {
            const auto_set=false
            const breadcrumbs = setSprintBreadcrumbsHelper(project, sprint, auto_set)
            breadcrumbs.push({to: '/projects/'+project_id+'/sprints/'+sprint_id+'/proposal/',
                              label: "Proposal",
                              type: 'sprint_proposal',
                              selected_entities: {project: project,
                                                  sprint: sprint}})
            dispatch(setBreadcrumbs(breadcrumbs))
        }
    }
    
    render() {
        const { project, sprint_id } = this.props
        project && setBrowserTitle(project.name)
        
        return (
            <div>
              <SprintProposal sprint_id={sprint_id} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const project_id = props.match.params.projectId
    const sprint_id = props.match.params.sprintId
    const project = getProject(state, project_id)
    const sprint = getSprint(state, sprint_id)
    
    return {
        project_id,
        project,
        sprint_id,
        sprint
    }
}

export default withRouter(connect(mapStateToProps)(SprintProposalPage))
