import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ensureProjectsLoaded, getProject } from '../actions/Projects'
import { map, keys } from 'lodash'
import OtherUser from './OtherUser'
import SprintTimeSummary from './SprintTimeSummary'
import SprintLink from './SprintLink'
import IssueLink from './IssueLink'
import CurrencyValue from './CurrencyValue'
import UserRate from './UserRate'
import ProgressBar from './ProgressBar'
import Timestamp from './Timestamp'
import Hours from './Hours'
import {
    ensureProjectStatementLoaded,
    getProjectStatement,
    isLoadingProjectStatement,
    update_project_statement_filter,
    get_project_statement_filter,
    invalidateProjectStatement,
    download_sprint_budgets,
    download_sprint_breakdown,
    download_issues_worked_on
} from '../actions/ProjectStatement'
import { ensureUsersLoaded } from '../actions/Users'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import {
    PAGE_KEY__PROJECT_DASHBOARD_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    PAGE_KEY__SPRINTS_PAGE,
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
    select_projects,
} from '../actions/Page'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';

class ProjectStatement extends Component {

    constructor(props) {
        super(props)
        this.updateDateFromInclusive = this.updateDateFromInclusive.bind(this)
        this.updateDateToInclusive = this.updateDateToInclusive.bind(this)
        this.refreshStatement = this.refreshStatement.bind(this)
        this.download_sprint_budgets = this.download_sprint_budgets.bind(this)
        this.download_sprint_breakdown_by_user = this.download_sprint_breakdown_by_user.bind(this)
        this.download_issues_worked_on = this.download_issues_worked_on.bind(this)
    }

    componentDidMount() {
        const { project_id, project, dispatch, project_statement } = this.props
        dispatch(set_toolbars(PAGE_KEY__SPRINTS_PAGE, ['project-statement']))
        if ( project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
            dispatch(ensureProjectStatementLoaded([project_id]))
        }
        this.refresh(project, project_statement)
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, filter } = this.props
        if ( new_props.project_id ) {
            dispatch(ensureProjectsLoaded([new_props.project_id]))
            dispatch(ensureProjectStatementLoaded([new_props.project_id], filter))
        }
        if ( new_props.project.name !== this.props.project.name ) {
            this.refresh(new_props.project, new_props.project_statement)
        }
        if ( new_props.project.allowed_user_ids !== this.props.project.allowed_user_ids ) {
            this.refresh(new_props.project, new_props.project_statement)
        }
    }

    download_sprint_budgets(event) {
        const { project_id, dispatch } = this.props
        event.preventDefault()
        dispatch(download_sprint_budgets(project_id))
    }
    
    download_sprint_breakdown_by_user(event) {
        const { project_id, dispatch  } = this.props
        event.preventDefault()
        dispatch(download_sprint_breakdown(project_id))
    }
    
    download_issues_worked_on(event) {
        const { project_id, dispatch  } = this.props
        event.preventDefault()
        dispatch(download_issues_worked_on(project_id))
    }

    updateDateFromInclusive(new_value) {
        const { filter, dispatch } = this.props
        dispatch(update_project_statement_filter(new_value,
                                                 filter.date_to_inclusive))
    }

    updateDateToInclusive(new_value) {
        const { filter, dispatch } = this.props
        dispatch(update_project_statement_filter(
            filter.date_from_inclusive,
            new_value))
    }

    refreshStatement() {
        const { project_id, dispatch } = this.props
        dispatch(invalidateProjectStatement(project_id))
    }

    refresh(project, project_statement) {
        const { dispatch } = this.props
        dispatch(select_projects(PAGE_KEY__PROJECT_DASHBOARD_PAGE, [project.id]))
        dispatch(setBreadcrumbs([ {to: '/projects', label: 'All Projects'},
                                  {to: '/projects/'+project.id, label: project.name},
                                  {to: '/projects/'+project.id+'/projectStatement', label: 'Project Statement'}]))
        dispatch(ensureUsersLoaded(project.allowed_user_ids))
    }

    render_filter() {
        const { filter } = this.props
        return (
            <div className="project__statement__filter">

              <div className="project__statement__filter__from">
                From:
                <DatePicker selected={filter.date_from_inclusive}
                            dateFormat="DD/MM/YYYY"
                            onChange={this.updateDateFromInclusive} />
              </div>

              <div className="project__statement__filter__to">
                To:
                <DatePicker selected={filter.date_to_inclusive}
                            dateFormat="DD/MM/YYYY"
                            onChange={this.updateDateToInclusive} />
              </div>

              <div className="project__statement__filter__submit">
                <button onClick={this.refreshStatement}>Filter</button>
              </div>

              <div className="clear">
              </div>
              
            </div>
        )
    }

    render_sprint_totals(project_statement) {
        const { sprint_infos } = project_statement
        return (
            <table className="project__statement__times_grid__table">
              <thead className="project__statement__times_grid__header">
                <tr>
                  <th>
                  </th>
                  { map(project_statement.users_with_time,
                        function(user_id) {
                            return (
                                <th key={user_id}>
                                  <OtherUser value={user_id} />
                                </th>
                            )
                        }
                    )
                  }
                </tr>

                <tr>
                  <th>
                  </th>
                  { map(project_statement.users_with_time,
                        function(user_id) {
                            return (
                                <td key={user_id}>
                                  <table width="100%">
                                    <tbody>
                                      <tr>
                                        <th className="project__statement__times_grid__inner_cell">
                                          Hours
                                        </th>
                                        <th className="project__statement__times_grid__inner_cell">
                                          Rate
                                        </th>
                                        <th className="project__statement__times_grid__inner_cell">
                                          Cost
                                        </th>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                            )
                        }
                    )
                  }
                </tr>
              </thead>
              <tbody>

                { map(keys(project_statement.times_by_sprint),
                      function(sprint_id) {
                          const times_for_sprint = project_statement.times_by_sprint[sprint_id]
                          return (
                              <tr key={sprint_id}>
                                <th>
                                  <SprintLink sprint_id={sprint_id}
                                              sprint_name={sprint_infos[sprint_id].sprint_name}
                                              project_id={sprint_infos[sprint_id].project_id} />
                                </th>
                                { map(project_statement.users_with_time,
                                      function(user_id) {
                                          const time_for_user = times_for_sprint.users[user_id]
                                          return (
                                              <td key={user_id}>
                                                <table width="100%">
                                                  <tbody>
                                                    <tr>
                                                      <td className="project__statement__times_grid__inner_cell">
                                                        <Hours hours={time_for_user.total_hours}/>
                                                      </td>
                                                      <td className="project__statement__times_grid__inner_cell project__statement__times_grid__rate_cell">
                                                        <UserRate value={time_for_user.rate}/>
                                                      </td>
                                                      <td className="project__statement__times_grid__inner_cell">
                                                        <CurrencyValue value={time_for_user.billable_cost}/>
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                              </td>
                                          )
                                      }
                                  )
                                }
                                              <th className="project__statement__times_grid__sprint_total">
                                                <CurrencyValue value={times_for_sprint.totals.total_billable_cost}/>
                                              </th>
                              </tr>
                          )
                      }
                  )
                }
              </tbody>
              <tfoot className="project__statement__times_grid__footer">
                <tr className="project__statement__times_grid__user_total">
                  <th>
                  </th>
                  { map(project_statement.users_with_time,
                        function(user_id) {
                            const time_for_user = project_statement.times_by_user[user_id]
                            return (
                                <th key={user_id}>
                                  <table width="100%">
                                    <tbody>
                                      <tr>
                                        <td className="project__statement__times_grid__inner_cell">
                                          <Hours hours={time_for_user.total_hours}/>
                                        </td>
                                        <td className="project__statement__times_grid__inner_cell">
                                        </td>
                                        <td className="project__statement__times_grid__inner_cell">
                                          <CurrencyValue value={time_for_user.total_billable_cost}/>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </th>
                            )
                        }
                    )
                  }
                                <th className="project__statement__times_grid__grand_total">
                                  <CurrencyValue value={project_statement.grand_totals.total_billable_cost}/>
                                </th>
                </tr>
              </tfoot>
            </table>
        )
    }

    render_sprint_budgets(project_statement) {
        const { sprint_infos } = project_statement
        return (
            <table className="project__statement__budgets_grid__table">
              <thead className="project__statement__budgets_grid__header">
                <tr>
                  <th></th>
                  <th>Total budget</th>
                  <th>Total spendable budget</th>
                  <th>Remaining budget</th>
                  <th>Budget progress</th>
                  <th>Spent</th>
                </tr>
              </thead>
              <tbody>
                { map(keys(project_statement.times_by_sprint),
                      function(sprint_id) {
                          const times_for_sprint = project_statement.times_by_sprint[sprint_id]
                          return (
                              <tr key={sprint_id}>
                                <th>
                                  <SprintLink sprint_id={sprint_id}
                                              sprint_name={sprint_infos[sprint_id].sprint_name}
                                              project_id={sprint_infos[sprint_id].project_id} />
                                </th>
                                <td>
                                  <CurrencyValue value={ times_for_sprint.totals_across_time.budget }/>
                                </td>
                                <td>
                                  <CurrencyValue value={ times_for_sprint.totals_across_time.spendable_budget } />
                                </td>
                                <td>
                                  <CurrencyValue value={ times_for_sprint.totals_across_time.remaining_budget } />
                                </td>
                                <td className="project__statement__budgets_grid__progress_bar">
                                  <ProgressBar current={ times_for_sprint.totals_across_time.total_billable_cost }
                                               max={ times_for_sprint.totals_across_time.spendable_budget } />
                                </td>
                                <th>
                                  <CurrencyValue value={ times_for_sprint.totals_across_time.total_billable_cost } />
                                </th>
                              </tr>
                          )
                      }
                  )
                }
              </tbody>
            </table>
        )
    }

    render_remaining_budgets(project_statement) {
        const { sprint_infos } = project_statement
        return (
            map(keys(sprint_infos),
                function(sprint_id) {
                    const sprint_info = sprint_infos[sprint_id]
                    return (
                        <div>
                          <h3 className="project__statement__remaining_grid__sprint_name"> 
                            <SprintLink sprint_id={sprint_id}
                                        sprint_name={sprint_info.sprint_name}
                                        project_id={sprint_info.project_id}
                            />
                          </h3>
                          <SprintTimeSummary key={sprint_id}
                                             sprint_id={sprint_id}
                                             project_id={sprint_info.project_id}/>
                        </div>
                    )
                    
                })
        )
    }

    render_issues_worked_on(project_statement) {
        const { project_id } = this.props
        const { sprint_infos } = project_statement
        return (
            <table className="project__statement__issues_grid__table">
              <tbody>
                { map(project_statement.issues,
                      function(issue_info) {
                          return (
                              <tr key={issue_info.number}>
                                <td>
                                  <SprintLink sprint_id={issue_info.sprint_id}
                                              sprint_name={sprint_infos[issue_info.sprint_id].sprint_name}
                                              project_id={sprint_infos[issue_info.sprint_id].project_id}
                                  />
                                </td>
                                <td>
                                  <IssueLink issue_id={issue_info.id}
                                             issue_number={issue_info.number}
                                             sprint_id={issue_info.sprint_id}
                                             project_id={project_id} />
                                </td>
                                <td>
                                  <div>{ issue_info.subject }</div>
                                </td>
                              </tr>
                          )
                      }
                  )
                }
              </tbody>
            </table>
        )
    }

    render() {

        const { is_loading, project_statement, filter } = this.props
        const that = this;

        return (
            <div className="project__statement">
              { is_loading &&
                <div>
                  <br/>
                  Loading...
                </div>
              }

                { that.render_filter() }
                
                { ! is_loading &&
                  <div className="project__statement__table_container">
                    <h3 className="project__statement__date_range">
                      <div className="project__statement__date_range__element">Statement from</div>
                      <div className="project__statement__date_range__element"><Timestamp value={project_statement.date_from_inclusive}/></div>
                      <div className="project__statement__date_range__element">to</div>
                      <div className="project__statement__date_range__element"><Timestamp value={project_statement.date_to_inclusive}/></div>
                      <div className="project__statement__date_range__element">(inclusive)</div>
                    </h3>

                    <div className="project__statement__separator" />
                    <div className="project__statement__budgets_grid">
                      <h2 className="project__statement__times_grid__header">Sprint budgets (for sprints worked on in the selected period)
                        <div className="project__statement__grid_icon icon--download_as_csv" onClick={this.download_sprint_budgets} />
                      </h2>
                      { project_statement.grand_totals && this.render_sprint_budgets(project_statement) }
                    </div>

                    <div className="project__statement__separator" />
                    <div className="project__statement__times_grid">
                      <h2 className="project__statement__times_grid__header">Sprint breakdown by user (during selected period)
                        <div className="project__statement__grid_icon icon--download_as_csv" onClick={this.download_sprint_breakdown_by_user} />
                      </h2>
                      { project_statement.grand_totals && this.render_sprint_totals(project_statement) }
                    </div>

                    <div className="project__statement__separator" />
                    <div className="project__statement__remaining_grid">
                      <h2 className="project__statement__remaining_grid__header">Remaining time (for sprints worked on in the selected period)
                      </h2>
                      { project_statement.grand_totals && this.render_remaining_budgets(project_statement) }
                    </div>

                    <div className="project__statement__issues_grid">
                      <h2 className="project__statement__times_grid__header">Issues worked on (during selected period)
                        <div className="project__statement__grid_icon icon--download_as_csv" onClick={this.download_issues_worked_on} />
                      </h2>
                        { project_statement.grand_totals && this.render_issues_worked_on(project_statement) }
                    </div>

                    <div className="project__statement__footer"/>
                        
                  </div>
                }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { project_id } = props
    const project = getProject(state, project_id) || {}
    const project_statement = getProjectStatement(state, project_id) || {}
    const is_loading = isLoadingProjectStatement(state, project_id)
    const filter = get_project_statement_filter(state)

    const num_days_before_month_become_interesting = 7
    if ( ! filter.date_from_inclusive ) {
        if ( moment().date() < num_days_before_month_become_interesting ) {
            filter.date_from_inclusive = moment().subtract(1, 'months').startOf('month');
        } else {
            filter.date_from_inclusive = moment().startOf('month');
        }
    }
    if ( ! filter.date_to_inclusive ) {
        if ( moment().date() < num_days_before_month_become_interesting ) {
            filter.date_to_inclusive = moment().subtract(1, 'months').endOf('month');
        } else {
            filter.date_to_inclusive = moment().endOf('month');
        }
    }

    return {
        project_id: project_id,
        project: project,
        project_statement: project_statement,
        is_loading: is_loading,
        filter: filter
    }
}

export default connect(mapStateToProps)(ProjectStatement)
