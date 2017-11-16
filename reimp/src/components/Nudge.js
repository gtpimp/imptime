import React, { Component } from 'react'
import { connect } from 'react-redux'
import { map } from 'lodash'
import {
    ensureNudgesLoaded,
    getNudge
} from '../actions/Nudges'

import { isLoadingItems } from '../actions/Item'
import Nudge from './Nudge'

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
              I am nudge
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { nudge_id } = props
    const nudge = getNudge(state, nudge_id)

    return {
        nudge,
        is_loading: nudge.id || true
    }
}

export default connect(mapStateToProps)(NudgeList)
