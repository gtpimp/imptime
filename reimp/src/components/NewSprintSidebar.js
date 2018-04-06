import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropertyStack from './PropertyStack'
import Sidebar from './Sidebar'
import {
    getCandidateSprint,
    updateCandidateName,
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
