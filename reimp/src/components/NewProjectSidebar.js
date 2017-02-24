import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import {browserHistory} from 'react-router'
import PropertyStack from './PropertyStack'
import PropertyStackComponent from './PropertyStackComponent'
import EditableProjectName from '../components/EditableProjectName'
import Timestamp from './Timestamp'
import moment from 'moment'
import Sidebar from './Sidebar'
import {
    getCandidateProject,
    updateCandidateName,
    cancelCandidateProject,
    saveCandidateProject
} from '../actions/Projects'
import ProjectNameForm from './form/ProjectNameForm'

class NewProjectSidebar extends Component {

    constructor(props) {
        super(props)
        this.onSaveCandidateProject = this.onSaveCandidateProject.bind(this)
    }

    onSaveCandidateProject(new_value) {
        const {dispatch} = this.props
        dispatch(updateCandidateName(new_value.name))
        dispatch(saveCandidateProject())
    }

    render() {

        const {project, comments, attachments} = this.props

        return (
            <Sidebar>
                <PropertyStack>
                    <div>
                        <div>
                            <ProjectNameForm onChange={this.onSaveCandidateProject}/>
                        </div>
                    </div>
                </PropertyStack>
            </Sidebar>
        )
    }
}

function mapStateToProps(state, props) {

    const candidate_project = getCandidateProject(state) || null
    return {
        candidate_project: candidate_project
    }
}

export default connect(mapStateToProps)(NewProjectSidebar)
