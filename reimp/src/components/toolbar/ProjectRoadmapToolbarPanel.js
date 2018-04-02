import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import '../../sass/toolbar-panel.css'
import classNames from 'classnames'
import {
    LIST_KEY__PROJECT_ROADMAP
} from '../../actions/ItemListKeyRegistry'
import { setSprintWidthMode, getSprintWidthMode } from '../../actions/SprintRoadmaps'

class ProjectRoadmapToolbarPanel extends Component {

    constructor(props) {
        super(props)
        this.setDisplayModeClockTime = this.setDisplayModeClockTime.bind(this)
        this.setDisplayModeDeadline = this.setDisplayModeDeadline.bind(this)
        this.setDisplayModeEstimate = this.setDisplayModeEstimate.bind(this)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps() {
        this.refresh()
    }

    setDisplayModeClockTime() {
        const { dispatch, list_key } = this.props
        dispatch(setSprintWidthMode(list_key, 'clock'))
    }

    setDisplayModeDeadline() {
        const { dispatch, list_key } = this.props
        dispatch(setSprintWidthMode(list_key, 'deadline'))
    }

    setDisplayModeEstimate() {
        const { dispatch, list_key } = this.props
        dispatch(setSprintWidthMode(list_key, 'estimate'))
    }

    refresh() {
    }
    
    render() {
        const { sprint_width_mode } = this.props
        
        return (
            <div className="toolbar-panel">
              <button className={classNames("button button--large button--primary",
                                            {"toolbar-button--enabled": sprint_width_mode=='clock'})}
                      onClick={this.setDisplayModeClockTime}>
                Clock time
              </button>
              <button className={classNames("button button--large button--primary",
                                            {"toolbar-button--enabled": sprint_width_mode=='deadline'})}
                      onClick={this.setDisplayModeDeadline}>
                Deadline
              </button>
              <button className={classNames("button button--large button--primary",
                                            {"toolbar-button--enabled": sprint_width_mode=='estimate'})}
                      onClick={this.setDisplayModeEstimate}>
                Estimate
              </button>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const list_key = LIST_KEY__PROJECT_ROADMAP
    const sprint_width_mode = getSprintWidthMode(state, list_key)
    
    return {
        list_key,
        sprint_width_mode
    }
}

export default connect(mapStateToProps)(ProjectRoadmapToolbarPanel)
