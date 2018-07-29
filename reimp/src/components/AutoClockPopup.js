import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import classNames from 'classnames'
import '../../sass/auto-clock.scss'
import { getAvailableAutoClockEntity, clockIn } from '../../actions/AutoClock'
import ProjectName from '../ProjectName'
import SprintName from '../SprintName'
import IssueName from '../IssueName'
import AutoClockEntryForm from './AutoClockEntryForm'
import PopupPanel from './PopupPanel'

class AutoClockPopup extends Component {
    constructor(props) {
        super(props)
        this.onClockIn = this.onClockIn.bind(this)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(props) {
        this.refresh(props)
    }

    refresh(these_props) {
        const props = these_props || this.props
    }

    onClockIn(new_values) {
        const { dispatch, available_project_id,
                available_sprint_id, available_issue_id } = this.props
        dispatch(clockIn(available_project_id,
                         available_sprint_id,
                         available_issue_id,
                         new_values.role,
                         new_values.description))
    }

    render() {
        const { available_project, available_project_id,
                available_sprint_id, available_issue_id } = this.props

        return (
            <PopupPanel>
              <div className="auto-clock__header">Auto clock</div>
              <div className="auto-clock__status">Not clocked in</div>

              <AutoClockEntryForm project_id={available_project_id}
                                  sprint_id={available_sprint_id}
                                  issue_id={available_issue_id}
                                  onSubmitted={this.onClockIn}
              />
              
            </PopupPanel>
        )
    }
}

function mapStateToProps(state, props) {
    const {  } = props

    const { available_project_id,
            available_sprint_id,
            available_issue_id } = getAvailableAutoClockEntity(state)

    return {
        available_project_id,
        available_sprint_id,
        available_issue_id
    }

}

export default connect(mapStateToProps)(AutoClockPopup)
