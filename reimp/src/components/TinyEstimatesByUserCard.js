import React, {Component} from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { map } from 'lodash'
import TinyCard from './TinyCard'
import TinyCardRow from './TinyCardRow'
import { ensureProjectsLoaded, getProject } from '../actions/Projects'
import { ensureSprintsLoaded, getSprint } from '../actions/Sprints'
import { setCardBreadcrumbsHelper } from '../actions/Breadcrumbs'
import { getCostSummary, ensureCostSummaryLoaded } from '../actions/CostSummary'
import OtherUser from './OtherUser'
import Hours from './Hours'

class TinyEstimatesByUserCard extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const {sprint_id, sprint, project_id, project, dispatch } = this.props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureCostSummaryLoaded(sprint_id))
        this.refresh(sprint, project)
    }

    componentWillReceiveProps(new_props) {
        const { sprint_id, project_id, dispatch } = new_props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureCostSummaryLoaded(sprint_id))
        if (new_props.sprint.id !== this.props.sprint.id ||
            new_props.sprint.name !== this.props.sprint.name ||
            new_props.project.name !== this.props.project.name) {
            this.refresh(new_props.sprint, new_props.project)
        }
    }

    refresh(sprint, project) {
        const { dispatch, project_id, sprint_id } = this.props
        if (project && sprint) {
            const card = {id: 'estimates_by_user',
                          name: 'Estimates By User'}
            dispatch(setCardBreadcrumbsHelper(project, sprint, card))                
        }
    }

    render() {
        const { sprint_name, project_name, estimates_by_user_id } = this.props
        return (
            <TinyCard title="Estimates By User" project_name={project_name} sprint_name={sprint_name}>
              {map (estimates_by_user_id, function(value, key) {
                  return (
                      <TinyCardRow>
                        <OtherUser user_id={key} />
                        <Hours hours={value.velocity_estimates} />
                      </TinyCardRow>
                  )
              })
              }
            </TinyCard>
        )
    }
}

function mapStateToProps(state, props) {
    const project_id = props.match.params.projectId
    const sprint_id = props.match.params.sprintId
    const sprint = getSprint(state, sprint_id) || {}
    const project = getProject(state, project_id) || {}
    const sprint_name = sprint.name
    const project_name = project.name
    const cost_summary = getCostSummary(state, sprint_id) || {}
    const breakdown = cost_summary.breakdown || {}
    const estimates_by_user_id = breakdown.revised_estimates_by_user || {}

    return {
        project_id,
        sprint_id,
        sprint,
        project,
        sprint_name,
        project_name,
        estimates_by_user_id
    }

}

export default withRouter(connect(mapStateToProps)(TinyEstimatesByUserCard))
