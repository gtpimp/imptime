import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { has_permission } from '../actions/Users'
import { getUser, ensureUsersLoaded } from '../actions/Users'
import { getSprint, ensureSprintsLoaded } from '../actions/Sprints'
import {
    getSprintUserRate,
    ensureSprintUserRateLoaded,
    isSurInvalidated,
    isSurLoading
} from '../actions/SprintUserRates'

class UserRate extends Component {

    componentDidMount() {
        this.refresh()
    }
    
    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }
    
    refresh(these_props) {
        const props = these_props || this.props
        const {dispatch, sprint_id, user_id} = props
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureUsersLoaded([user_id]))
        dispatch(ensureSprintUserRateLoaded(sprint_id, user_id))
    }
    
    render() {
        const { value, class_name } = this.props

        var formatter = new Intl.NumberFormat('en-GB', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
            // style: 'currency',
            // currency: 'ZAR',
            // currencyDisplay: 'symbol',
        })
        const formatted_currency = formatter.format(value)
        
        return (
            <div className={classNames("user_rate",
                                       {"user_rate--empty" :value==0})}>
              R {formatted_currency}
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { sprint_id, user_id } = props

    const user = getUser(state, user_id) || {}
    const sprint = getSprint(state, sprint_id) || {}
    const sur = getSprintUserRate(state, sprint_id, user_id) || {}
    const can_view = has_permission(state, sprint.project_id, "has_view_ctc_billable_rates")
    const is_invalidated = isSurInvalidated(state, sur.id)
    const is_loading = isSurLoading(state, sur.id)
    
    return {
        value: sur.billable_amount,
        can_view,
        is_invalidated,
        is_loading
    }
}

export default connect(mapStateToProps)(UserRate)
