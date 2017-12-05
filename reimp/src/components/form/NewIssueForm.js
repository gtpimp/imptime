import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field } from 'redux-form';
import Textarea from 'react-expanding-textarea'
import '../../sass/text-component.scss'
import SprintSelectorField from './SprintSelectorField'
import IssueTitleField from './IssueTitleField';
import PropertyStackComponent from '../PropertyStackComponent'

class NewIssueForm extends Component {

    render() {
        const { handleSubmit, onKeyDown, project_id, initialValues } = this.props

        return (
            <form onSubmit={handleSubmit}>
              <div>
                <div className="issue_sidebar--textarea">
                  <PropertyStackComponent title="Title">
                    <IssueTitleField onKeyDown={onKeyDown} />
                  </PropertyStackComponent>
                  <PropertyStackComponent title="Sprint">
                    <SprintSelectorField project_id={project_id} auto_focus={false} />
                  </PropertyStackComponent>
                </div>
                <button className="button issue_sidebar--textarea" type="submit">Submit</button>
              </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted, onKeyDown, project_id, sprint_id } = props

    return {
        initialValues: {title:'',
                        sprint_id: sprint_id},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        onKeyDown,
        project_id
    }
}

export default connect(mapStateToProps)(reduxForm({form:'new_issue_form'})(NewIssueForm))
