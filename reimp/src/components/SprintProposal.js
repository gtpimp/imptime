import React, {Component} from 'react'
import {connect} from 'react-redux'
import {
    ensureSprintsLoaded,
    getSprint
} from '../actions/Sprints'
import SprintName from './SprintName'

class SprintProposal extends Component {

    componentDidMount() {
        const { dispatch, sprint_id } = this.props
        sprint_id && dispatch(ensureSprintsLoaded([sprint_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = this.props
        const { sprint_id } = new_props
        sprint_id && dispatch(ensureSprintsLoaded([sprint_id]))
    }

    render() {
        const { sprint_id } = this.props

        return (
            <div>
            This is the sprint proposal for <SprintName sprint_id={sprint_id}/>
            </div>
        )
    }    
}

function mapStateToProps(state, props) {

    const { sprint_id } = props
    const sprint = getSprint(state, sprint_id)
    
    return {
        sprint_id,
        sprint
    }
}

export default connect(mapStateToProps)(SprintProposal)
