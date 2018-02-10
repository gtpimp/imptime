import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import classNames from 'classnames'
import '../../sass/auto-clock.scss'
import { getAvailableAutoClockEntity } from '../../actions/AutoClock'
import ProjectName from '../ProjectName'
import SprintName from '../SprintName'
import IssueName from '../IssueName'
import AutoClockEntryForm from './AutoClockEntryForm'

class AutoClockPopup extends Component {
    constructor(props) {
        super(props)
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

    render() {
        const { available_project, available_project_id,
                available_sprint_id, available_issue_id } = this.props

        return (
            <div className="auto-clock">
              <div className="auto-clock__header">Auto clock</div>
              <div className="auto-clock__status">Not clocked in</div>
              <div className="auto-clock__actions">Clock in</div>

              <AutoClockEntryForm project_id={available_project_id}
                                  sprint_id={available_sprint_id}
                                  issue_id={available_issue_id} />
                
              
            </div>
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
