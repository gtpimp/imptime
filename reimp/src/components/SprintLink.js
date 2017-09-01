import React, { Component } from 'react'
import { connect } from 'react-redux'
import {browserHistory} from 'react-router'

class SprintLink extends Component {

    constructor(props) {
        super(props)
        this.on_clicked = this.on_clicked.bind(this)
    }
    
    on_clicked() {
        const { sprint_id, project_id, onClick, open_on_click } = this.props
        if ( onClick ) {
            onClick(sprint_id, project_id, sprint_id)
        } else if ( open_on_click ) {
            browserHistory.push('/projects/' + project_id + '/sprints/' + sprint_id);
        }
    }
    
    render() {
        const { sprint_id, sprint_name, onClick } = this.props

        return (
            <div className="sprint_link" onClick={this.on_clicked}>
	      {sprint_name}
	    </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { sprint_id, sprint_name, project_id } = props

    return {
        sprint_name: sprint_name,
        sprint_id: sprint_id,
        project_id: project_id,
        onClick: props.onClick,
        open_on_click: props.open_on_click || true
    }
}

export default connect(mapStateToProps)(SprintLink)
