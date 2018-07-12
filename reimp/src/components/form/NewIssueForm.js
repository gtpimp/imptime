import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm } from 'redux-form';
import '../../sass/text-component.scss'
import SprintSelectorField from './SprintSelectorField'
import ProjectSelectorField from './ProjectSelectorField'
import IssueTitleField from './IssueTitleField';
import PropertyStackComponent from '../PropertyStackComponent'

class NewIssueForm extends Component {

    constructor(props) {
        super(props)
        this.state = { project_id: null,
                       sprint_id: null }
        this.onChangeProject = this.onChangeProject.bind(this)
    }

    componentDidMount() {
        const { default_project_id, default_sprint_id } = this.props
        this.setState( {project_id: default_project_id,
                        sprint_id: default_sprint_id} )
    }

    onChangeProject(new_project_id) {
        this.setState({project_id:new_project_id})
    }

    render() {
        const { handleSubmit, onKeyDown, default_project_id } = this.props
        const { project_id } = this.state

        return (
            <form onSubmit={handleSubmit}>
              <div>
                <div className="issue_sidebar--textarea">
                  <PropertyStackComponent title="Title">
                    <IssueTitleField onKeyDown={onKeyDown} />
                  </PropertyStackComponent>
                  <PropertyStackComponent title="Project (default is the current project)">
                    <ProjectSelectorField auto_focus={false}
                                          onChange={this.onChangeProject}
                                          default_project_id={project_id || default_project_id} />
                  </PropertyStackComponent>
                  
                  { project_id &&
                    <PropertyStackComponent title="Sprint (default is the current sprint)">
                      <SprintSelectorField project_id={project_id} auto_focus={false} />
                    </PropertyStackComponent>
                  }
                </div>
                <button className="button issue_sidebar--textarea" type="submit">Submit</button>
              </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted, onKeyDown, default_project_id, default_sprint_id } = props
    
    return {
        initialValues: {title:'',
                        project_id: default_project_id,
                        sprint_id: default_sprint_id},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        onKeyDown,
        default_project_id
    }
}

export default connect(mapStateToProps)(reduxForm({form:'new_issue_form'})(NewIssueForm))
