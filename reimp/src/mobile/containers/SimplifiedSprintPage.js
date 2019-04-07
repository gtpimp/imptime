import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import SimplifiedPage from './SimplifiedPage'
import SimplifiedSprint from '../components/SimplifiedSprint'
import SimplifiedLoading from '../components/SimplifiedLoading'
import {
    ensureSprintsLoaded,
    getSprint,
    isLoadingSprints
} from '../../actions/Sprints'

class SimplifiedSprintPage extends Component {

    componentDidMount() {
        const { dispatch, sprint_id } = this.props
        dispatch(ensureSprintsLoaded([sprint_id]))
    }

    componentDidUpdate(old_props) {
        const { dispatch, sprint_id } = this.props
        if ( old_props.sprint_id !== sprint_id ) {
            dispatch(ensureSprintsLoaded([sprint_id]))
        }
    }
    
    render() {
        const { sprint, sprint_id, is_loading } = this.props

        if ( is_loading ) {
            return <SimplifiedLoading />
        }
        
        return (
            <SimplifiedPage title={sprint.name}>
              <SimplifiedSprint sprint_id={sprint_id} />
            </SimplifiedPage>
        )
    }
}

function mapStateToProps(state, props) {

    const sprint_id = props.match.params.sprintId
    const sprint = getSprint(state, sprint_id)
    const is_loading = isLoadingSprints(state, [sprint_id]) || !sprint

    return {
        sprint_id,
        sprint,
        is_loading
    }
}

export default withRouter(connect(mapStateToProps)(SimplifiedSprintPage))
