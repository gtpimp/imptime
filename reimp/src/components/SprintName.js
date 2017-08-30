import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    ensureSprintsLoaded, getSprint
} from '../actions/Sprints'

class SprintName extends Component {

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

    render_inline_small() {
	      const { sprint, loading_value, onClick } = this.props

	      return (
	          <div key={this.key+".collapsed_sprint."+sprint.id}
		             onClick={onClick}
	          >
		          {sprint.name }
	          </div>
	      )
    }

    render() {
        const { sprint_id, sprint, render_mode, loading_value, onClick } = this.props

        if ( ! sprint_id ) {
            return ( <div onClick={onClick}></div> )
        }

	if ( sprint.loaded === false ) {
	    return ( <div onClick={onClick}>{loading_value}</div> )
	}

	if ( render_mode === 'inline--small' ) {
	    return this.render_inline_small()
	} else {
	    return ( <div>Dev error, unsupported render mode: {render_mode}</div> )
	}
    }
}

function mapStateToProps(state, props) {
    const { sprint_id, render_mode, loading_value } = props
    const sprint = ((sprint_id && (getSprint(state, sprint_id))) || { 'loaded': false, 'id': sprint_id }) || { 'sprintname': 'no-one' }

    return {
	sprint: sprint,
        sprint_id: sprint_id,
	render_mode: render_mode || "inline--small",
	loading_value: loading_value || "..."
    }
}

export default connect(mapStateToProps)(SprintName)
