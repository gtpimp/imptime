import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropertyStack from './PropertyStack'
import Sidebar from './Sidebar'
import {
    getCandidateProject,
    updateCandidateName,
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

        return (
            <Sidebar>
                <PropertyStack>
                    <div>
                        <div>
                            <ProjectNameForm onSubmit={this.onSaveCandidateProject}/>
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
