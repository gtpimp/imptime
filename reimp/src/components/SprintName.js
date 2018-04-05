import React, { Component } from 'react'
import { connect } from 'react-redux'
import { includes } from 'lodash'
import {
    ensureSprintsLoaded, getSprint
} from '../actions/Sprints'
import {withRouter, Link} from 'react-router-dom'

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
	const { sprint, loading_value, display_mode } = this.props

	return (
	    <Link className="sprint_name--inline-small"
                  to={'/projects/' + sprint.project_id + '/sprints/' + sprint.id}
                  key={this.key+".collapsed_sprint."+sprint.id} >
	      {sprint.name }
              <div className="sprint_name__display_mode_extra">
                { includes(display_mode, "status") &&
                  <div className="sprint_name__status">
                    {sprint.status_name}
                  </div>
                }
                { includes(display_mode, "type") &&
                  <div className="sprint_name__type">
                    {sprint.sprint_type}
                  </div>
                }
              </div>
	    </Link>
	)
    }

    render() {
        const { sprint_id, sprint, render_mode, loading_value, onClick } = this.props

        if ( ! sprint_id ) {
            return (
                <Link to={'/projects/' + sprint.project_id + '/sprints/' + sprint.id}>
                </Link>
            )
        }

	if ( sprint.loaded === false ) {
	    return (
                <Link to={'/projects/' + sprint.project_id + '/sprints/' + sprint.id}>
                  {loading_value}
                </Link>
            )
	}

	if ( render_mode === 'inline--small' ) {
	    return this.render_inline_small()
	} else {
	    return ( <div>Dev error, unsupported render mode: {render_mode}</div> )
	}
    }
}

function mapStateToProps(state, props) {
    const { sprint_id, render_mode, loading_value, display_mode } = props
    const sprint = ((sprint_id && (getSprint(state, sprint_id))) || { 'loaded': false, 'id': sprint_id }) || { 'sprintname': 'no-one' }

    return {
	sprint: sprint,
        sprint_id: sprint_id,
	render_mode: render_mode || "inline--small",
	loading_value: loading_value || "...",
        display_mode: display_mode || ["name"]
    }
}

export default withRouter(connect(mapStateToProps)(SprintName))
