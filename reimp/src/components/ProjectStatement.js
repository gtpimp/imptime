import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ensureProjectsLoaded, getProject } from '../actions/Projects'
import { map, keys } from 'lodash'
import OtherUser from './OtherUser'
import SprintName from './SprintName'
import CurrencyValue from './CurrencyValue'
import Hours from './Hours'
import {
    ensureProjectStatementLoaded,
    getProjectStatement,
    isLoadingProjectStatement
} from '../actions/ProjectStatement'
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

class ProjectStatement extends Component {

    constructor(props) {
        super(props)
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
        const { dispatch } = this.props
        if ( new_props.project_id ) {
            dispatch(ensureProjectsLoaded([new_props.project_id]))
            dispatch(ensureProjectStatementLoaded([new_props.project_id]))
        }
        if ( new_props.project.name !== this.props.project.name ) {
            this.refresh(new_props.project, new_props.project_statement)
        }
    }

    refresh(project, project_statement) {
        const { dispatch } = this.props
        dispatch(select_projects(PAGE_KEY__PROJECT_DASHBOARD_PAGE, [project.id]))
        dispatch(setBreadcrumbs([ {to: '/projects', label: 'All Projects'},
                                  {to: '/projects/'+project.id, label: project.name},
                                  {to: '/projects/'+project.id+'/projectStatement', label: 'Project Statement'}]))
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

    render_sprint_times(sprint_id, times_for_sprint) {
        return (
            <div key={sprint_id} className="project_statement__times_for_sprint">
              <div className="project_statement__sprint_header">
                <div className="project_statement__sprint_name">
                  <SprintName sprint_id={sprint_id}/>
                </div>
                <div className="project_statement__sprint_header__total_billable_cost">
                  <CurrencyValue value={times_for_sprint.totals.total_billable_cost}/>
                </div>
                <div className="project_statement__sprint_header__total_hours">
                  <Hours hours={times_for_sprint.totals.total_hours}/>
                </div>
              </div>
              <div className="project_statement__times_for_sprint__users">
                { map(times_for_sprint.users,
                      function(time_for_user) {
                          return (
                              <div key={""+time_for_user.user_id+sprint_id} className="project_statement__time_for_user">
                                <div className="project_statement__time_for_user__user">
                                  <OtherUser value={time_for_user.user_id} />
                                </div>
                                <div className="project_statement__time_for_user__rate">
                                  @<CurrencyValue value={time_for_user.rate}  />
                                </div>
                                <div className="project_statement__time_for_user__hours">
                                  <Hours hours={time_for_user.total_hours} />
                                </div>
                                <div className="project_statement__time_for_user__cost">
                                  <CurrencyValue value={time_for_user.billable_cost} />
                                </div>
                              </div>
                          )
                      }
                 )}
            </div>
            </div>
        )
    }
    
    render() {

        const { is_loading, project_statement } = this.props
        const that = this;

        return (
            <div>
              { is_loading &&
                <div>
                  <br/>
                  Loading...
                </div>
              }

                { ! is_loading &&
                  <div>
                    { project_statement.grand_totals && that.render_totals(project_statement.grand_totals) }
                    <div className="project__statement__times_grid">
                          { map(keys(project_statement.times_by_sprint),
                                function(sprint_id) {
                                    var times_for_sprint = project_statement.times_by_sprint[sprint_id]
                                    return that.render_sprint_times(sprint_id, times_for_sprint)
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

    return {
        project_id: project_id,
        project: project,
        project_statement: project_statement,
        is_loading: is_loading
    }
}

export default connect(mapStateToProps)(ProjectStatement)
