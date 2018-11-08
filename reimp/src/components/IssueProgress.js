import React, {Component} from 'react'
import {connect} from 'react-redux'
import { css } from 'emotion'
import moment from 'moment'
import ReactTimeout from 'react-timeout'
import { getIssue, ensureIssuesLoaded } from '../actions/Issues'
import { makeSelActualsByUserId, makeSelEstimatesByUserId } from '../selectors/IssueSelectors'
import { logged_in_user } from '../actions/Auth'
import Progress from './Progress'
import Hours from './Hours'

class IssueProgress extends Component {

    constructor(props) {
        super(props)
        this.incrementTimer = this.incrementTimer.bind(this)
        this.state = { live_timer_start: null,
                       live_timer_offset: 0}
    }
    
    componentDidMount() {
        const { dispatch, issue_id, enable_live_timer } = this.props
        dispatch(ensureIssuesLoaded([issue_id]))
        if ( enable_live_timer ) {
            this.setState({ live_timer_start: moment(),
                            live_timer_offset: 0})
        }
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, issue_id, enable_live_timer } = new_props
        dispatch(ensureIssuesLoaded([issue_id]))

        if ( enable_live_timer &&
             (this.props.issue_id !== new_props.issue_id ||
              this.props.optional_actual !== new_props.optional_actual) ) {
            
            this.setState({live_timer_start: moment(),
                           live_timer_offset: 0})
        }
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { enable_live_timer, setInterval } = props
        if ( enable_live_timer && !this.incrementingTimer ) {
            this.incrementingTimer = setInterval(this.incrementTimer, 30*1000) // every 30 seconds
        } else if ( ! enable_live_timer && !this.incrementingTimer ) {
            clearInterval(this.incrementingTimer)
        }
    }

    incrementTimer() {
        this.setState({live_timer_offset: moment().diff(this.state.live_timer_start, 'hours', true)})
    }

    render() {
        const { issue, user_id, running_actual_increment, all_actuals_by_user_id, all_estimates_by_user_id } = this.props
        const { live_timer_offset } = this.state

        const estimate = (all_estimates_by_user_id && all_estimates_by_user_id[user_id] && all_estimates_by_user_id[user_id].estimate_hours) || null
        const actual = live_timer_offset + running_actual_increment + ((all_actuals_by_user_id && all_actuals_by_user_id[user_id] && all_actuals_by_user_id[user_id].hours) || 0)
        
        return (
            <div className={css`display:flex;align-items:center;height:100%;`}>
              { actual && estimate && 
                <Progress issue={issue} actual={actual} estimate={estimate} />
              }
              { actual && ! estimate &&
                <Hours hours={actual} />
              }
            </div>
        )
    }
}

const makeMapStateToProps = () => {
    const selEstimatesByUserId = makeSelEstimatesByUserId()
    const selActualsByUserId = makeSelActualsByUserId()
    const mapStateToProps = (state, props) => {
    
        const { issue_id, running_actual_increment, optional_user_id, enable_live_timer } = props
        const issue = getIssue(state, issue_id)
        const user_id = optional_user_id || logged_in_user(state).user_id

        const all_actuals_by_user_id = selActualsByUserId(state, props)
        const all_estimates_by_user_id = selEstimatesByUserId(state, props)
        
        return {
            issue,
            user_id,
            running_actual_increment: running_actual_increment || 0,
            is_loading: !issue || !issue.id,
            all_actuals_by_user_id,
            all_estimates_by_user_id,
            enable_live_timer: enable_live_timer || false
        }
    }
    return mapStateToProps
}


export default connect(makeMapStateToProps)(ReactTimeout(IssueProgress))

