import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    ensureSprintsLoaded, getSprint
} from '../actions/Sprints'
import {withRouter} from 'react-router-dom'

class SprintNameUnclickable extends Component {

    componentDidMount() {
        this.refresh(this.props)
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(props) {
	const { dispatch, sprint_id, sprint } = props
	if ( sprint.loaded === false ) {
	    dispatch(ensureSprintsLoaded([sprint_id]))
	}
    }
    
    render() {
        const { sprint_id, sprint, loading_value } = this.props

        if ( ! sprint_id ) {
            return null
        }

	if ( sprint.loaded === false ) {
	    return <div>{loading_value}</div>
	}

        return (
            <div>
	      {sprint.name }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { sprint_id, loading_value } = props
    const sprint = ((sprint_id && (getSprint(state, sprint_id))) || { 'loaded': false, 'id': sprint_id }) || { 'sprintname': 'no-one' }

    return {
	sprint: sprint,
        sprint_id: sprint_id,
	loading_value: loading_value || "..."
    }
}

export default withRouter(connect(mapStateToProps)(SprintNameUnclickable))
