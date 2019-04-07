import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import {
    ensureSprintsLoaded,
    getSprint,
    isLoadingSprints
} from '../../actions/Sprints'
import SimplifiedParagraph from './SimplifiedParagraph'

class SimplifiedSprint extends Component {

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
        const { sprint, is_loading } = this.props

        if ( is_loading ) {
            return null
        }
        
        return (
            <div>
              <SimplifiedParagraph>
                {sprint.description}
                
              </SimplifiedParagraph>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { sprint_id } = props
    const sprint = getSprint(state, sprint_id)
    const is_loading = isLoadingSprints(state, [sprint_id]) || !sprint

    return {
        sprint_id,
        sprint,
        is_loading
    }
    
}

export default withRouter(connect(mapStateToProps)(SimplifiedSprint))
