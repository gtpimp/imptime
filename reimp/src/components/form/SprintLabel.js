import React, {Component} from 'react'
import {connect} from 'react-redux'
import { getSprint, ensureSprintsLoaded } from '../../actions/Sprints'

class SprintLabel extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        if ( new_props.sprint_id !== this.props.sprint_id ) {
            this.refresh()
        }
    }

    refresh() {
        const { dispatch, sprint_id } = this.props
        if ( sprint_id ) {
            dispatch(ensureSprintsLoaded([sprint_id]))
        }
    }

    render() {
        const { sprint } = this.props
        return (
            <div>
                {sprint.name}
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { value } = props
    const sprint_id = value
    const sprint = getSprint(state, sprint_id) || {}
    
    return {
        sprint: sprint
    }
}

export default connect(mapStateToProps)(SprintLabel)

