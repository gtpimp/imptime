import React, { Component } from 'react'
import { get, isEmpty, map, size } from 'lodash'
import { DragSource, DropTarget } from 'react-dnd'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { DndTypes } from '../actions/Dnd'
import '../sass/project-summary.scss'
import {
    getSummary,
    ensureSummariesLoaded
} from '../actions/WorkSummary'
import { ensureSprintsLoaded, getSprints } from '../actions/Sprints'
import { ensureUsersLoaded } from '../actions/Users'
import { ensureIssuesLoaded, getIssues } from '../actions/Issues'
import { ensureProjectsLoaded, getProjects } from '../actions/Projects'
import ProjectName from './ProjectName'
import SprintName from './SprintName'
import OtherUser from './OtherUser'
import UserRate from './UserRate'
import ProgressBar from './ProgressBar'
import Hours from './Hours'
import Timestamp from './Timestamp'
import TimeChart from './TimeChart'
import IssueLink from './IssueLink'
import SprintLink from './SprintLink'
import ProjectLink from './ProjectLink'

class WorkSummary extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const { dispatch, summary_id, summary } = these_props || this.props
        if ( summary_id ) {
            dispatch(ensureSummariesLoaded([summary_id]))
        }
        if ( summary ) {
            if ( summary.sprint_ids ) {
                dispatch(ensureSprintsLoaded(summary.sprint_ids))
            }
            if ( summary.user_ids ) {
                dispatch(ensureUsersLoaded(summary.user_ids))
            }
            if ( summary.project_ids ) {
                dispatch(ensureProjectsLoaded(summary.project_ids))
            }
            if ( summary.issue_ids ) {
                dispatch(ensureIssuesLoaded(summary.issue_ids))
            }
        }
    }

    render() {
        const { summary_id, summary, new_issues, with_time_issues, new_sprints, new_projects } = this.props

        const show_new_issues = !isEmpty(new_issues)
        const show_with_time_issues = !isEmpty(with_time_issues)
        const show_new_sprints = !isEmpty(new_sprints)
        const show_new_projects = !isEmpty(new_projects)

        const show_empty = !show_new_issues && !show_with_time_issues && !show_new_sprints && !show_new_projects

        return (
            <div className={classNames("summary")}>
              { ! summary_id &&
                <div>Loading...</div>
              }
              { summary_id &&
                <div>
                  <div className="summary__title">
                    <h2 className="summary__name">
                      { summary.day }
                    </h2>
                    { show_empty && <p>Nothing to see here</p> }
                    { show_new_issues && <div><h3>New issues:</h3>
                    <ul>
                      { map(new_issues, (issue) => {
                        return <li key={issue.id}>
                          <ProjectName project_id={issue.project_id} />
                          <SprintName sprint_id={issue.sprint_id} />
                          <IssueLink issue_id={issue.id}
                                     sprint_id={issue.sprint_id}
                                     project_id={issue.project_id}
                                     issue_number={issue.number}
                          />
                        </li>
                      }) }
                    </ul></div> }
                    { show_with_time_issues && <div><h3>Issues with time:</h3>
                    <ul>
                    { map(with_time_issues, (issue) => {
                        return <li key={issue.id}>
                          <ProjectName project_id={issue.project_id} />
                          <SprintName sprint_id={issue.sprint_id} />
                          <IssueLink issue_id={issue.id}
                                     sprint_id={issue.sprint_id}
                                     project_id={issue.project_id}
                                     issue_number={issue.number}
                          />
                        </li>
                    }) }
                    </ul></div> }
                    { show_new_sprints && <div><h3>New sprints:</h3>
                    <ul>
                    { map(new_sprints, (sprint) => {
                        return <li key={sprint.id}>
                          <ProjectName project_id={sprint.project_id} />
                          <SprintLink sprint_id={sprint.id}
                                      sprint_name={sprint.name}
                                      project_id={sprint.project_id}
                          />
                        </li>
                    }) }
                    </ul></div> }
                    { show_new_projects && <div><h3>New projects:</h3>
                    <ul>
                    { map(new_projects, (project) => {
                        return <li key={project.id}><ProjectLink project_id={project.id}
                                            project_name={project.name}
                        /></li>
                    }) }
                    </ul></div> }
                  </div>
                </div>
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { summary_id } = props
    const summary = getSummary(state, summary_id)

    return {
	summary: summary || {},
        summary_id: (summary || {}).id,
        new_issues: getIssues(state, get(summary, 'new_issues', [])),
        with_time_issues: getIssues(state, get(summary, 'with_time_issues', [])),
        new_sprints: getSprints(state, get(summary, 'new_sprints', [])),
        new_projects: getProjects(state, get(summary, 'new_projects', []))
    }
}

export default connect(mapStateToProps)(WorkSummary)
