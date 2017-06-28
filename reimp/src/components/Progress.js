import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import Duration from '../components/Duration'
import ProgressBar from '../components/ProgressBar'
import { format_hours } from '../actions/lib'

class Progress extends Component {

    render() {
        const {issue} = this.props
        const active = issue.currently_clocked_in_by_user_ids && issue.currently_clocked_in_by_user_ids.length > 0
        const current = format_hours(issue.actual_hours || 0)
        const max = format_hours(issue.dev_estimate_hours || 0)
        return (
            <div className="progress">
                <div className="progress__component progress__component--timer">
                    { active && <div className={classNames('icon--timer-' + (active ? 'active' : 'inactive'))}></div> }
                </div>
                <div className="progress__component progress__component--progress">
                    <div className="progress__time">
                        <div className={classNames('progress__time', 'progress__time--' + ( current <= max ? 'progress' : 'over'))}>
                            <Duration value={current}/>
                        </div>
                        <div className="progress__time-separator">/</div>
                        <div className="progress__time progress__time--max">
                            <Duration value={max}/>
                        </div>
                    </div>
                    <div className="progress__progress_bar">
                        <ProgressBar current={current} max={max}/>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {}
}


export default connect(mapStateToProps)(Progress)
