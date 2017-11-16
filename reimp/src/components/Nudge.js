import React, { Component } from 'react'
import { connect } from 'react-redux'
import { map } from 'lodash'
import {
    ensureNudgesLoaded,
    getNudge
} from '../actions/Nudges'

import { isLoadingItems } from '../actions/Item'
import Nudge from './Nudge'
import IssueName from './IssueName'
import SprintName from './SprintName'
import ProjectName from './ProjectName'

class NudgeList extends Component {

    constructor(props) {
        super(props)
    }
    
    componentDidMount() {
	const { dispatch, nudge_id } = this.props
	dispatch(ensureNudgesLoaded([nudge_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, nudge_id } = new_props
	dispatch(ensureNudgesLoaded([nudge_id]))
    }

    render() {

        const { nudge, is_loading } = this.props
        const that = this

        if ( is_loading ) {
            return (
                <div>Loading...</div>
            )
        }
        
        return (
            <div className="nudge">
              <div className="nudge__project">
                <ProjectName project_id={nudge.project_id} />
              </div>
              <div className="nudge__sprint">
                <SprintName sprint_id={nudge.sprint_id} />
              </div>
              <div className="nudge__issue">
                <IssueName issue_id={nudge.issue_id} />
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { nudge_id } = props
    const nudge = getNudge(state, nudge_id)

    return {
        nudge,
        is_loading: !nudge.id
    }
}

export default connect(mapStateToProps)(NudgeList)
