import React, { Component } from 'react'
import { connect } from 'react-redux'
import { includes } from 'lodash'
import {
    ensureSprintsLoaded, getSprint
} from '../actions/Sprints'
import {withRouter} from 'react-router-dom'

class SprintName extends Component {

    constructor(props) {
        super(props)
        this.on_clicked = this.on_clicked.bind(this)
    }

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

    on_clicked(event) {
        const { history, sprint, onClick, open_on_click } = this.props
        event.stopPropagation()
        if ( onClick ) {
            onClick(sprint.id)
        } else if ( open_on_click ) {
            history.push('/projects/' + sprint.project_id + '/sprints/' + sprint.id);
        }
    }

    render_inline_small() {
	const { sprint, loading_value, display_mode } = this.props

	return (
	    <div className="sprint_name--inline-small"
                 key={this.key+".collapsed_sprint."+sprint.id}
		 onClick={this.on_clicked}
	    >
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
    const { sprint_id, render_mode, loading_value, display_mode } = props
    const sprint = ((sprint_id && (getSprint(state, sprint_id))) || { 'loaded': false, 'id': sprint_id }) || { 'sprintname': 'no-one' }

    return {
	sprint: sprint,
        sprint_id: sprint_id,
	render_mode: render_mode || "inline--small",
	loading_value: loading_value || "...",
        onClick: props.onClick,
        open_on_click: props.open_on_click || true,
        display_mode: display_mode || ["name"]
    }
}

export default connect(mapStateToProps)(withRouter(SprintName))
