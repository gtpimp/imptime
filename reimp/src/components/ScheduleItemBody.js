import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropertyStack from './PropertyStack'
import PropertyStackComponent from './PropertyStackComponent'
import { ensureIssuesLoaded, getIssue } from '../actions/Issues'
import { ensureSprintsLoaded } from '../actions/Sprints'
import { ensureProjectsLoaded } from '../actions/Projects'
import { deleteCalendarEvent } from '../actions/CalendarEvents'
import ProjectName from './ProjectName'
import SprintName from './SprintName'
import IssueName from './IssueName'
import IssueDescription from './IssueDescription'

class ScheduleItemBody extends Component {

    constructor(props) {
        super(props)
        this.onDelete = this.onDelete.bind(this)
    }
    
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

    onDelete() {
        const { dispatch, schedule_item, onDeleted } = this.props
        if ( ! window.confirm("Delete this schedule?") ) {
            return
        }
        dispatch(deleteCalendarEvent(schedule_item.id))
        onDeleted(schedule_item.id)
    }

    render() {
        const { schedule_item, can_edit, issue } = this.props

        return (
            <div className={'planning-calendar__schedule-item'}>
              <PropertyStack>
                <PropertyStackComponent>
                  { schedule_item.project_id &&
                    <ProjectName project_id={schedule_item.project_id}/>
                  }
                  { schedule_item.sprint_id &&
                    <SprintName sprint_id={schedule_item.sprint_id}/>
                  }
                  { schedule_item.issue_id &&
                    <IssueName issue_id={schedule_item.issue_id}/>
                  }
                </PropertyStackComponent>
                { issue && 
                  <PropertyStackComponent>
                    <IssueDescription issue={issue} mode="view-value" />
                  </PropertyStackComponent>
                }
                { can_edit &&
                  <PropertyStackComponent>
                    <button className="button button--danger issue_sidebar--button" onClick={this.onDelete}>
                      Unschedule
                    </button>
                  </PropertyStackComponent>
                }
              </PropertyStack>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { schedule_item, can_edit, onDeleted } = props
    const issue = schedule_item.issue_id && getIssue(state, schedule_item.issue_id)
    return {
        can_edit,
        onDeleted,
        issue
    }
}

export default connect(mapStateToProps)(ScheduleItemBody)
