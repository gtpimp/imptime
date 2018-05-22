import React, { Component } from 'react'
import { connect } from 'react-redux'
import { map, keyBy, keys } from 'lodash'
import Timestamp from './Timestamp'
import classNames from 'classnames'
import {
    ensureBillableHoursStatementLoaded,
    getBillableHoursStatement,
    isLoadingBillableHoursStatement,
    update_billable_hours_statement_filter,
    get_billable_hours_statement_filter,
    invalidateBillableHoursStatement,
    isBillableHoursStatementInvalidated
} from '../actions/BillableHoursStatement'
import {
    PAGE_KEY__BILLABLE_HOURS_STATEMENT_PAGE,
    BILLABLE_HOURS_STATEMENT_HEADER_LIST__BY_PROJECT_AND_USER,
    BILLABLE_HOURS_STATEMENT_HEADER_LIST__BY_USER,
    BILLABLE_HOURS_STATEMENT_HEADER_LIST__BY_PROJECT,
} from '../actions/ItemListKeyRegistry'
import {set_toolbars} from '../actions/Page'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import DivTable from './DivTable'
import { getCellStyle } from '../actions/ItemListKeyRegistry'
import ProjectName from './ProjectName'
import SprintName from './SprintName'
import OtherUser from './OtherUser'
import Hours from './Hours'
import CurrencyValue from './CurrencyValue'
import { ensureSprintsLoaded } from '../actions/Sprints'
import { ensureProjectsLoaded } from '../actions/Projects'
import { ensureUsersLoaded } from '../actions/Users'

class BillableHoursStatement extends Component {

    constructor(props) {
        super(props)
        this.updateDateFromInclusive = this.updateDateFromInclusive.bind(this)
        this.updateDateToInclusive = this.updateDateToInclusive.bind(this)
        this.refreshStatement = this.refreshStatement.bind(this)
    }

    componentDidMount() {
        const { dispatch, filter } = this.props
        dispatch(set_toolbars(PAGE_KEY__BILLABLE_HOURS_STATEMENT_PAGE, ['billable-hours-statement']))
        dispatch(invalidateBillableHoursStatement())
        dispatch(ensureBillableHoursStatementLoaded(filter))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, filter } = new_props
        dispatch(ensureBillableHoursStatementLoaded(filter))
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, billable_hours_statement } = props
        if ( billable_hours_statement.all_user_ids ) {
            dispatch(ensureUsersLoaded(billable_hours_statement.all_user_ids))
        }
        if ( billable_hours_statement.all_project_ids ) {
            dispatch(ensureProjectsLoaded(billable_hours_statement.all_project_ids))
        }
        if ( billable_hours_statement.all_sprint_ids ) {
            dispatch(ensureSprintsLoaded(billable_hours_statement.all_sprint_ids))
        }
    }

    updateDateFromInclusive(new_value) {
        const { filter, dispatch } = this.props
        dispatch(update_billable_hours_statement_filter(new_value,
                                                 filter.date_to_inclusive))
    }

    updateDateToInclusive(new_value) {
        const { filter, dispatch } = this.props
        dispatch(update_billable_hours_statement_filter(filter.date_from_inclusive, new_value))
    }

    refreshStatement() {
        const { dispatch } = this.props
        dispatch(invalidateBillableHoursStatement())
    }

    render_filter() {
        const { filter, billable_hours_statement } = this.props
        return (
            <div className="billable_hours_statement__filter">

              <div className="billable_hours_statement__date_filter">

              <div className="billable_hours_statement__filter__from">
                  From:
                  <DatePicker selected={filter.date_from_inclusive}
                              dateFormat="DD/MM/YYYY"
                              onChange={this.updateDateFromInclusive} />
                </div>

                <div className="billable_hours_statement__filter__to">
                  To:
                  <DatePicker selected={filter.date_to_inclusive}
                              dateFormat="DD/MM/YYYY"
                              onChange={this.updateDateToInclusive} />
                </div>

                <div className="billable_hours_statement__filter__submit">
                  <button onClick={this.refreshStatement}>Filter</button>
                </div>
              </div>

              <h3 className="billable_hours_statement__date_range">
                <div className="billable_hours_statement__date_range__element">Showing hours logged from</div>
                <div className="billable_hours_statement__date_range__element"><Timestamp value={billable_hours_statement.date_from_inclusive}/></div>
                <div className="billable_hours_statement__date_range__element">to</div>
                <div className="billable_hours_statement__date_range__element"><Timestamp value={billable_hours_statement.date_to_inclusive}/></div>
                <div className="billable_hours_statement__date_range__element">(inclusive)</div>
              </h3>
              
              <div className="clear">
              </div>
              
            </div>
        )
    }

    renderHoursRow(header_list, row, index) {
        const headers_by_key = keyBy(header_list, "key")
        const visible_header_keys = keys(headers_by_key)
        
        return (
            <div key={index}
                 className={classNames('billable-hours-statement', 'div-table__row')}
	    >

              { map(visible_header_keys, function(header_key) {
                    const header = headers_by_key[header_key]
                    switch(header_key) {
                        case "project":
                            return (
                                <div className="div-table__cell" key={header_key}
                                     style={getCellStyle(header)}>
                                  <ProjectName project_id={row.project_id} />
                                </div>
                            )
                        case "sprint":
                            return (
                                <div className="div-table__cell" key={header_key}
                                     style={getCellStyle(header)}>
                                  <SprintName sprint_id={row.sprint_id} />
                                </div>
                            )
                        case "user":
                            return (
                                <div className="div-table__cell" key={header_key}
                                     style={getCellStyle(header)}>
                                  <OtherUser user_id={row.user_id} />
                                </div>
                            )
                        case "hours":
                            return (
                                <div className="div-table__cell" key={header_key}
                                     style={getCellStyle(header)}>
                                  <Hours hours={row.sum_hours} />
                                </div>
                            )
                        case "cost":
                            return (
                                <div className="div-table__cell" key={header_key}
                                     style={getCellStyle(header)}>
                                  <CurrencyValue value={row.cost_with_commission} />
                                </div>
                            )
                        default:
                            console.error("Unknown header: " + header_key)
                            
                    }
                })}
                                
            </div>
        )
    }

    renderHoursPerProjectAndUser(by_project_and_user) {
        const { header_list_by_project_and_user } = this.props
        return (
            <DivTable header_list={header_list_by_project_and_user}>
              {map(by_project_and_user, (row, index) => this.renderHoursRow(header_list_by_project_and_user, row, index))}
            </DivTable>
        )
    }

    renderHoursPerProject(by_project) {
        const { header_list_by_project } = this.props
        return (
            <DivTable header_list={header_list_by_project}>
              {map(by_project, (row, index) => this.renderHoursRow(header_list_by_project, row, index))}
            </DivTable>
        )
    }

    renderHoursPerUser(by_user) {
        const { header_list_by_user } = this.props
        return (
            <DivTable header_list={header_list_by_user}>
              {map(by_user, (row, index) => this.renderHoursRow(header_list_by_user, row, index))}
            </DivTable>
        )
    }

    render() {

        const { billable_hours_statement, is_loading } = this.props
        const that = this;

        return (
            <div className="billable-hours-statement">
              { is_loading &&
                <div>
                  <br/>
                  Loading...
                </div>
              }

              { that.render_filter() }

              { ! is_loading &&
                <div className="billable-hours-statement__results-container">
                  <div className="billable-hours-statement__results-list">
                    <h2>By User</h2>
                    { this.renderHoursPerUser(billable_hours_statement.by_user) }
                  </div>
                  <div className="billable-hours-statement__results-list">
                    <h2>By Project</h2>
                    { this.renderHoursPerProject(billable_hours_statement.by_project) }
                  </div>
                  <div className="billable-hours-statement__results-list">
                    <h2>By Project, Sprint and User</h2>
                    { this.renderHoursPerProjectAndUser(billable_hours_statement.by_project_and_user) }
                  </div>
                </div>
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const header_list_by_project_and_user=BILLABLE_HOURS_STATEMENT_HEADER_LIST__BY_PROJECT_AND_USER
    const header_list_by_project=BILLABLE_HOURS_STATEMENT_HEADER_LIST__BY_PROJECT
    const header_list_by_user=BILLABLE_HOURS_STATEMENT_HEADER_LIST__BY_USER
    
    const billable_hours_statement = getBillableHoursStatement(state) || {}
    const is_loading = isLoadingBillableHoursStatement(state)
    const is_invalidated = isBillableHoursStatementInvalidated(state)
    const filter = get_billable_hours_statement_filter(state)
    const show_invoices_section = true

    const num_days_before_month_become_interesting = 7
    if ( ! filter.date_from_inclusive ) {
        if ( moment().date() < num_days_before_month_become_interesting ) {
            filter.date_from_inclusive = moment().subtract(1, 'months').startOf('month')
        } else {
            filter.date_from_inclusive = moment().startOf('month');
        }
    }
    if ( ! filter.date_to_inclusive ) {
        if ( moment().date() < num_days_before_month_become_interesting ) {
            filter.date_to_inclusive = moment().subtract(1, 'months').endOf('month')
        } else {
            filter.date_to_inclusive = moment().endOf('month');
        }
    }
    
    return {
        billable_hours_statement,
        is_loading,
        is_invalidated,
        filter,
        show_invoices_section,
        header_list_by_project_and_user,
        header_list_by_project,
        header_list_by_user
    }
}

export default connect(mapStateToProps)(BillableHoursStatement)
