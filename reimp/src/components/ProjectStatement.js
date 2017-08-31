import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ensureProjectsLoaded, getProject } from '../actions/Projects'
import { map, keys } from 'lodash'
import OtherUser from './OtherUser'
import SprintName from './SprintName'
import CurrencyValue from './CurrencyValue'
import Timestamp from './Timestamp'
import Hours from './Hours'
import {
    ensureProjectStatementLoaded,
    getProjectStatement,
    isLoadingProjectStatement,
    update_project_statement_filter,
    get_project_statement_filter,
    invalidateProjectStatement
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
    }

    componentDidMount() {
        const { project_id, project, dispatch, project_statement } = this.props
        dispatch(set_toolbars(PAGE_KEY__SPRINTS_PAGE, ['cost-summary']))
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
        if ( new_props.project.allowed_user_ids != this.props.project.allowed_user_ids ) {
            this.refresh(new_props.project, new_props.project_statement)
        }
    }

    updateDateFromInclusive(new_value) {
        const { filter, dispatch } = this.props
        dispatch(update_project_statement_filter(
            new_value,
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
            <div>

              From:
              <DatePicker selected={filter.date_from_inclusive}
                          dateFormat="DD/MM/YYYY"
                          onChange={this.updateDateFromInclusive} />

              To:

              <DatePicker selected={filter.date_to_inclusive}
                          dateFormat="DD/MM/YYYY"
                          onChange={this.updateDateToInclusive} />

              <button onClick={this.refreshStatement}>Filter</button>
              
            </div>
        )
    }

    render_totals(grand_totals) {
        return (
            <div className="project_statement__grand_totals">
              <h2>Running total across project</h2>
              <div className="project_statement__grand_totals__total_hours">
                <Hours hours={grand_totals.total_hours}/>
              </div>
              <div className="project_statement__grand_totals__total_billable_cost">
                <CurrencyValue value={grand_totals.total_billable_cost}/>
              </div>
              <div className="clear"></div>
            </div>
        )
    }

    render_user_headers(project_statement) {
        return (
            <div className="project__statement__times_grid">

              <div className="project__statement__sprint_times__sprint_column">
                <div className="project__statement__sprint_times__sprint_column_header">
                </div>

                { map(keys(project_statement.times_by_sprint),
                      function(sprint_id) {
                          return (
                              <div className="project__statement__sprint_times__sprint">
                                <SprintName sprint_id={sprint_id} />
                              </div>
                          )
                      }
                     )
                }
              </div>
              
              { map(project_statement.users_with_time,
                    function(user_id) {
                        return (
                            <div key={user_id} className="project__statement__sprint_times__user_column">
                              <div className="project__statement__sprint_times__header__user">
                                <OtherUser value={user_id} />
                              </div>
                              <div className="project__statement__sprint_times__values">
                                <div className="project__statement__sprint_times__hours_column">
                                  <div className="project__statement__sprint_times__header__hours">
                                    Hours
                                  </div>
                                  { map(keys(project_statement.times_by_sprint),
                                      function(sprint_id) {
                                          const time_for_user = project_statement.times_by_sprint[sprint_id].users[user_id]
                                          return (
                                              <div className="project__statement__sprint_times__value__hours">
                                                <Hours hours={time_for_user.total_hours}/>
                                              </div>
                                          )
                                      }
                                       )
                                  }
                                </div>
                                <div className="project__statement__sprint_times__rate_column">
                                  <div className="project__statement__sprint_times__header__hours">
                                    Rate
                                  </div>
                                  { map(keys(project_statement.times_by_sprint),
                                      function(sprint_id) {
                                          const time_for_user = project_statement.times_by_sprint[sprint_id].users[user_id]
                                          return (
                                              <div className="project__statement__sprint_times__value__rate">
                                                <CurrencyValue value={time_for_user.rate}/>
                                              </div>
                                          )
                                      }
                                       )
                                  }
                                </div>
                                <div className="project__statement__sprint_times__cost_column">
                                  <div className="project__statement__sprint_times__header__cost">
                                    Cost
                                  </div>
                                  { map(keys(project_statement.times_by_sprint),
                                      function(sprint_id) {
                                          const time_for_user = project_statement.times_by_sprint[sprint_id].users[user_id]
                                          return (
                                              <div className="project__statement__sprint_times__value__cost">
                                                <CurrencyValue value={time_for_user.billable_cost}/>
                                              </div>
                                          )
                                      }
                                       )
                                  }
                                </div>
                              </div>

                            </div>
                        )
                    }
                   )
              }

              <div className="project__statement__sprint_times__sprint_column">
                <div className="project__statement__sprint_times__sprint_column_header">
                </div>
                { map(keys(project_statement.times_by_sprint),
                      function(sprint_id) {
                          return (
                              <div className="project__statement__sprint_times__sprint">
                                <SprintName sprint_id={sprint_id} />
                              </div>
                          )
                      }
                     )
                }
              </div>

            
            </div>
        )
    }

    render_sprint_times(sprint_id, times_for_sprint) {
        return (
            <div className="project__statement__sprint_times__row">
              <div className="project_statement__sprint_name">
                <SprintName sprint_id={sprint_id}/>
              </div>
              { map(keys(times_for_sprint.users),
                    function(user_id) {
                        const time_for_user = times_for_sprint.users[user_id]
                        return (
                            <div key={user_id} className="project__statement__sprint_times__user_cell">
                              <div className="project_statement__sprint_header__total_hours">
                                <Hours hours={times_for_sprint.totals.total_hours}/>
                              </div>
                              <div className="project_statement__time_for_user__rate">
                                @<CurrencyValue value={time_for_user.rate}  />
                              </div>
                              <div className="project_statement__sprint_header__total_billable_cost">
                                <CurrencyValue value={times_for_sprint.totals.total_billable_cost}/>
                              </div>
                            </div>
                        )
                    }
              )}
            </div>
        )
    }

    render_user_times(user_id, times_for_user) {
        return (
            <div key={user_id} className="project_statement__times_for_user">
              <div className="project_statement__user_header">
                <div className="project_statement__user_name">
                  <OtherUser value={user_id}/>
                </div>
                <div className="project_statement__user_header__total_hours">
                  
                </div>
                <div className="project_statement__user_header__total_billable_cost">
                  <CurrencyValue value={times_for_user.total_billable_cost}/>
                </div>
              </div>
            </div>
        )
    }
    
    render() {

        const { is_loading, project_statement, filter } = this.props
        const that = this;

        return (
            <div>
              { is_loading &&
                <div>
                  <br/>
                  Loading...
                </div>
              }

                { that.render_filter() }
                
                { ! is_loading &&
                  <div>
                    <h3 className="project__statement__date_range">
                      <div className="project__statement__date_range__element">Statement from</div>
                      <div className="project__statement__date_range__element"><Timestamp value={project_statement.date_from_inclusive}/></div>
                      <div className="project__statement__date_range__element">to</div>
                      <div className="project__statement__date_range__element"><Timestamp value={project_statement.date_to_inclusive}/></div>
                      <div className="project__statement__date_range__element">(inclusive)</div>
                    </h3>
                    { project_statement.grand_totals && that.render_totals(project_statement.grand_totals) }

                    <div className="project__statement__times_grid">
                        { this.render_user_headers(project_statement) }
                    </div>

                    <div className="project__statement__times_grid">
                      <h2>Summary by sprint</h2>
                      { map(keys(project_statement.times_by_sprint),
                            function(sprint_id) {
                                var times_for_sprint = project_statement.times_by_sprint[sprint_id]
                                return that.render_sprint_times(sprint_id, times_for_sprint)
                            }
                        )
                      }
                    </div>

                    <div className="project__statement__times_grid">
                      <h2>Summary by user</h2>
                      { map(keys(project_statement.times_by_user),
                            function(user_id) {
                                var times_for_user = project_statement.times_by_user[user_id]
                                return that.render_user_times(user_id, times_for_user)
                            }
                        )
                      }
                    </div>
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

    if ( ! filter.date_from_inclusive ) {
        filter.date_from_inclusive = moment().startOf('month');
    }
    if ( ! filter.date_to_inclusive ) {
        filter.date_to_inclusive = moment().endOf('month');
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
