import React, { Component } from 'react'
import { keys, get, map } from 'lodash'
//import { DragSource, DropTarget } from 'react-dnd'
import { connect } from 'react-redux'
//import classNames from 'classnames'
//import { DndTypes } from '../actions/Dnd'
import '../sass/project-summary.scss'
import {
    getSummary,
    ensureSummariesLoaded
} from '../actions/WorkSummary'
import { ensureSprintsLoaded } from '../actions/Sprints'
import { ensureUsersLoaded } from '../actions/Users'
import { ensureIssuesLoaded } from '../actions/Issues'
import { ensureProjectsLoaded } from '../actions/Projects'
import ProjectName from './ProjectName'
import OtherUser from './OtherUser'
import Timestamp from './Timestamp'
import IssueName from './IssueName'
import Hours from './Hours'
import IssueStatus from './IssueStatus'

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
            if ( summary.all_issue_ids ) {
                dispatch(ensureIssuesLoaded(summary.all_issue_ids))
            }
        }
    }

    render_junk() {
        /* return (
         *     <div>
         * { show_new_issues && <div><h3>New issues:</h3>
         *   <ul>
         *     { map(new_issues, (issue) => {
         *           return <li key={issue.id}>
         *     <ProjectName project_id={issue.project_id} />
         *     <SprintName sprint_id={issue.sprint_id} />
         *     <IssueLink issue_id={issue.id}
         *                sprint_id={issue.sprint_id}
         *                project_id={issue.project_id}
         *                issue_number={issue.number}
         *     />
         *           </li>
         *       }) }
         *   </ul></div> }
         * { show_with_time_issues && <div><h3>Issues with time:</h3>
         *     <ul>
         *       { map(with_time_issues, (issue) => {
         *             return <li key={issue.id}>
         *       <ProjectName project_id={issue.project_id} />
         *       <SprintName sprint_id={issue.sprint_id} />
         *       <IssueLink issue_id={issue.id}
         *                  sprint_id={issue.sprint_id}
         *                  project_id={issue.project_id}
         *                  issue_number={issue.number}
         *       />
         *             </li>
         *         }) }
         *     </ul></div> }
         * { show_new_sprints && <div><h3>New sprints:</h3>
         *       <ul>
         *         { map(new_sprints, (sprint) => {
         *               return <li key={sprint.id}>
         *         <ProjectName project_id={sprint.project_id} />
         *         <SprintLink sprint_id={sprint.id}
         *                     sprint_name={sprint.name}
         *                     project_id={sprint.project_id}
         *         />
         *               </li>
         *           }) }
         *       </ul></div> }
         * { show_new_projects && <div><h3>New projects:</h3>
         *         <ul>
         *           { map(new_projects, (project) => {
         *                 return <li key={project.id}><ProjectLink project_id={project.id}
         *                                                          project_name={project.name}
         *                                             /></li>
         *             }) }
         *         </ul></div> }
         *     </div>
         * )*/
    }

    render_issue(issue_id) {
        return (
            <div key={issue_id}
                 className="work-summary__project-card__issue">
              <IssueName issue_id={issue_id} />
              <div className="work-summary__project-card__issue_props">
                <IssueStatus issue_id={issue_id} />
              </div>
            </div>
        )
    }

    render_project_card_created_issues(project_items) {
        if ( ! project_items.created_issues ) {
            return null
        }
        return (
            <div className="work-summary__project-card__content">
              <div className="work-summary__project-card__content-title">
                New issues
              </div>
              <div className="work-summary__project-card__issues_list">
                { map(project_items.created_issues, (project_item) => this.render_issue(project_item.issue_id)) }
              </div>
            </div>
        )
    }
    
    render_project_card_modified_issues(project_items) {
        if ( ! project_items.modified_issues ) {
            return null
        }
        return (
            <div className="work-summary__project-card__content">
              <div className="work-summary__project-card__content-title">
                Modified issues
              </div>
              <div className="work-summary__project-card__issues_list">
                { map(project_items.modified_issues, (project_item) => this.render_issue(project_item.issue_id)) }
              </div>
            </div>
        )
    }
    
    render_project_card_issues_with_time(project_items) {
        if ( ! project_items.issues_with_time ) {
            return null
        }
        return (
            <div className="work-summary__project-card__content">
              <div className="work-summary__project-card__content-title">
                Issues worked on
              </div>
              <div className="work-summary__project-card__issues_list">
                { map(project_items.issues_with_time, (project_item) => this.render_issue(project_item.issue_id)) }
              </div>
            </div>
        )
    }
    
    render_project_card(project_id) {
        const { summary } = this.props
        const project_items = summary.projects[project_id]
        return (
            <div key={project_id} className="work-summary__project-card">
              <div className="work-summary__project-card__title">
                <ProjectName project_id={project_id} />
              </div>
              { this.render_project_card_issues_with_time(project_items) }
              { this.render_project_card_created_issues(project_items) }
              { this.render_project_card_modified_issues(project_items) }
              
            </div>
        )
    }

    render_user_card(user_id) {
        const { summary } = this.props
        const user_items = summary.users[user_id]
        return (
            <div key={user_id} className="work-summary__user-card">
              <div className="work-summary__user-card__title">
                <OtherUser user_id={user_id} />
              </div>
              <div className="work-summary__user-card__content">
                <div className="work-summary__user-card__content-title">
                  Issues worked on
                </div>
                <div className="work-summary__user-card__issues_list">
                  { map(user_items.issues, (issue_item) => (
                        <div key={issue_item.issue_id} className="work-summary__user-card__issue">
                          <IssueName issue_id={issue_item.issue_id}/>
                          <Hours hours={issue_item.hours}/>
                        </div>
                    )
                    )}
                </div>
              </div>
            </div>
        )
    }
    
    render() {
        const { summary_id, summary, is_empty } = this.props

        return (
            <div className="work-summary">
              { ! summary.id &&
                <div>Loading...</div>
              }
              { summary_id &&
                <div>
                  <div className="work-summary__title">
                    <h2 className="work-summary__name">
                      Work summary for <Timestamp value={summary.day} format="date" />
                    </h2>

                    { is_empty &&
                      <div className="work-summary__project-card">
                        On this day, nothing happened
                      </div>
                    }

                    <div className="work-summary__cards-container">
                      <div className="works-summary__column">
                        <h3>User actions</h3>
                        <div className="work-summary__user-cards">
                          { summary.length !== 0 &&
                            map(keys(summary.users), (user_id) => this.render_user_card(user_id))
                          }
                        </div>
                      </div>

                      <div className="works-summary__column">
                          <h3>Things done</h3>
                          <div className="work-summary__project-cards">
                          { summary.length !== 0 &&
                            map(keys(summary.projects), (project_id) => this.render_project_card(project_id))
                          }
                        </div>
                      </div>
                    </div>

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
        is_empty: keys(get(summary, ["projects"], {})).length === 0
    }
}

export default connect(mapStateToProps)(WorkSummary)
