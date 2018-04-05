import React, { Component } from 'react'
import { connect } from 'react-redux'
import {withRouter, Link} from 'react-router-dom'

class SprintLink extends Component {

    render() {
        const { sprint_id, project_id, sprint_name } = this.props

        return (
            <Link
                to={'/projects/' + project_id + '/sprints/' + sprint_id}
                className="sprint_link">
	      {sprint_name}
	    </Link>
        )
    }
}

function mapStateToProps(state, props) {
    const { sprint_id, sprint_name, project_id } = props

    return {
        sprint_name: sprint_name,
        sprint_id: sprint_id,
        project_id: project_id
    }
}

export default withRouter(connect(mapStateToProps)(SprintLink))
