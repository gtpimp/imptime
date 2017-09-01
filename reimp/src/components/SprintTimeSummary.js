import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'
import {ensureTimeSummaryLoaded, getTimeSummary} from '../actions/TimeSummary'
import OtherUser from '../components/OtherUser'
import CurrencyValue from '../components/CurrencyValue'

class SprintTimeSummary extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const {sprint_id, project_id, sprint, project, dispatch} = this.props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureTimeSummaryLoaded(sprint_id))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        const { dispatch} = this.props
        dispatch(ensureProjectsLoaded([new_props.project_id]))
        dispatch(ensureSprintsLoaded([new_props.sprint_id]))
        dispatch(ensureTimeSummaryLoaded(new_props.sprint_id))
        if ( new_props.sprint.id !== this.props.sprint.id ||
             new_props.sprint.name !== this.props.sprint.name ||
             new_props.project.name !== this.props.project.name ) {
            this.refresh()
        }
    }

    refresh() {
    }

    renderUser(value, index) {

        const { has_budget } = this.props

        return (
            <div>
              <span>
                <OtherUser value={index} />
              </span>
              <p>Dev Hours Used: {value.dev_hours_used}</p>
              { has_budget &&
                <div>
                  <p>Developer Hours Available: {value.dev_hours_available}</p>
                  <p>Tester Hours Available: {value.tester_hours_available}</p>
                  <p>Manager Hours Available: {value.manager_hours_available}</p>
                </div>
              }
              { ! has_budget &&
                <div>
                  <p>Percentage Over Budget: {value.percentage_over_budget}</p>
                </div>
              }
            </div>
        )
    }

    render() {

        const { sprint, project, per_user } = this.props

        return (
            <div>
              { per_user &&
                <div>
                  {map(per_user, (value, index) =>
                      <div className="cost-summary__role" key={index}>
                        {this.renderUser(value, index)}
                      </div>
                   )}
                </div>
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {sprint_id, project_id} = props
    const sprint = getSprint(state, sprint_id) || {}
    const project = getProject(state, project_id) || {}
    const time_summary = getTimeSummary(state, sprint_id) || {}
    const per_user = time_summary.per_user || {}
    const has_budget = time_summary.has_budget || null

    return {
        sprint_id: sprint_id,
        sprint: sprint,
        project_id: project_id,
        project: project,
        time_summary: time_summary,
        per_user: per_user,
        has_budget: has_budget
    }
}

export default connect(mapStateToProps)(SprintTimeSummary)
