import React, {Component} from 'react'
import {connect} from 'react-redux'
import { ensureIssuesLoaded } from '../actions/Issues'
import { ensureSprintsLoaded } from '../actions/Sprints'
import { ensureProjectsLoaded } from '../actions/Projects'
import ProjectNameUnclickable from './ProjectName'
import SprintNameUnclickable from './SprintNameUnclickable'
import IssueNameUnclickable from './IssueNameUnclickable'

class ScheduleItemTitle extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, schedule_item } = props
        if ( schedule_item.project_id ) {
            dispatch(ensureProjectsLoaded([schedule_item.project_id]))
        }
        if ( schedule_item.sprint_id ) {
            dispatch(ensureSprintsLoaded([schedule_item.sprint_id]))
        }
        if ( schedule_item.issue_id ) {
            dispatch(ensureIssuesLoaded([schedule_item.issue_id]))
        }
    }

    render() {
        const { schedule_item } = this.props

        return (
            <div className={'schedule-item-title'}>
              
              { schedule_item.project_id &&
                <div className="schedule-item-title__part"><ProjectNameUnclickable project_id={schedule_item.project_id}/></div>
              }
              { schedule_item.sprint_id &&
                <div className="schedule-item-title__part">&gt; <SprintNameUnclickable sprint_id={schedule_item.sprint_id}/></div>
              }
              { schedule_item.issue_id &&
                <div className="schedule-item-title__part">&gt; <IssueNameUnclickable issue_id={schedule_item.issue_id}/></div>
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {
    }
}

export default connect(mapStateToProps)(ScheduleItemTitle)
