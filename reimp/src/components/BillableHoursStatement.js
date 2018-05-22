import React, { Component } from 'react'
import { connect } from 'react-redux'
import Timestamp from './Timestamp'
import {
    ensureBillableHoursStatementLoaded,
    getBillableHoursStatement,
    isLoadingBillableHoursStatement,
    update_billable_hours_statement_filter,
    get_billable_hours_statement_filter,
    invalidateBillableHoursStatement,
    isBillableHoursStatementInvalidated
} from '../actions/BillableHoursStatement'
import {PAGE_KEY__BILLABLE_HOURS_STATEMENT_PAGE} from '../actions/ItemListKeyRegistry'
import {set_toolbars} from '../actions/Page'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';

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
        dispatch(ensureBillableHoursStatementLoaded(filter))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, filter } = new_props
        dispatch(ensureBillableHoursStatementLoaded(filter))
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

    render() {

        const { is_loading } = this.props
        const that = this;

        return (
            <div className="billable_hours_statement">
              { is_loading &&
                <div>
                  <br/>
                  Loading...
                </div>
              }

              { that.render_filter() }

              { ! is_loading &&
                <div className="billable_hours_statement__table_container">
                  Hi
                </div>
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
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
        show_invoices_section
    }
}

export default connect(mapStateToProps)(BillableHoursStatement)
