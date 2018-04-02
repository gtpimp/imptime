import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import {withRouter} from 'react-router-dom'
import PropertyStack from './PropertyStack'
import PropertyStackComponent from './PropertyStackComponent'
import EditableSprintName from '../components/EditableSprintName'
import Timestamp from './Timestamp'
import moment from 'moment'
import Sidebar from './Sidebar'
import {
    getCandidateSprint,
    updateCandidateName,
    cancelCandidateSprint,
    saveCandidateSprint
} from '../actions/Sprints'
import SprintNameForm from './form/SprintNameForm'

class NewSprintSidebar extends Component {

    constructor(props) {
        super(props)
        this.onSaveCandidateSprint = this.onSaveCandidateSprint.bind(this)
    }

    onSaveCandidateSprint(new_value) {
        const {dispatch} = this.props
        dispatch(updateCandidateName(new_value.name))
        dispatch(saveCandidateSprint())
    }

    render() {

        const {sprint, comments, attachments} = this.props

        return (
            <Sidebar>
                <PropertyStack>
                    <div>
                        <div>
                            <SprintNameForm onSubmitted={this.onSaveCandidateSprint}/>
                        </div>
                    </div>
                </PropertyStack>
            </Sidebar>
        )
    }
}

function mapStateToProps(state, props) {

    const candidate_sprint = getCandidateSprint(state) || null
    return {
        candidate_sprint: candidate_sprint
    }
}

export default connect(mapStateToProps)(NewSprintSidebar)
