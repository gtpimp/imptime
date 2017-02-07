import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import {browserHistory} from 'react-router'
import PropertyStack from './PropertyStack'
import PropertyStackComponent from './PropertyStackComponent'
import EditableSprintTitle from '../components/EditableSprintTitle'
import Timestamp from './Timestamp'
import moment from 'moment'
import Sidebar from './Sidebar'
import {
    getCandidateSprint,
    updateCandidateTitle,
    cancelCandidateSprint,
    saveCandidateSprint
} from '../actions/Sprints'
import SprintTitleForm from './form/SprintTitleForm'

class NewSprintSidebar extends Component {

    constructor(props) {
        super(props)
        this.onSaveCandidateSprint = this.onSaveCandidateSprint.bind(this)
    }

    onSaveCandidateSprint(new_value) {
        const {dispatch} = this.props
        dispatch(updateCandidateTitle(new_value.title))
        dispatch(saveCandidateSprint())
    }

    render() {

        const {sprint, comments, attachments} = this.props

        return (
            <Sidebar>
                <PropertyStack>
                    <div>
                        <div>
                            <SprintTitleForm onChange={this.onSaveCandidateSprint}/>
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
