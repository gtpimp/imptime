import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm } from 'redux-form';
import '../../sass/text-component.scss'
import IssueTitleField from './IssueTitleField';
import PropertyStackComponent from '../PropertyStackComponent'

class NewIssueForm extends Component {

    constructor(props) {
        super(props)
        this.state = { project_id: null,
                       sprint_id: null }
        this.onChangeProject = this.onChangeProject.bind(this)
    }

    onChangeProject(new_project_id) {
        this.setState({project_id:new_project_id})
    }

    keyDown = (event) => {
        const { onCancelCreateIssue } = this.props
        if (event.keyCode === 27) {
            event.preventDefault()
            if ( onCancelCreateIssue ) {
                onCancelCreateIssue()
            }
        }
    }

    render() {
        const { handleSubmit } = this.props

        return (
            <form onSubmit={handleSubmit}>
              <div>
                <div className="issue_sidebar--textarea">
                  <PropertyStackComponent title="Title">
                    <IssueTitleField onKeyDown={this.keyDown} />
                  </PropertyStackComponent>
                </div>
                <button className="button issue_sidebar--textarea" type="submit">Submit</button>
              </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted, onCancelCreateIssue } = props
    
    return {
        initialValues: Object.assign({},
                                     {title:''}),
        enableReinitialize: true,
        onSubmit: onSubmitted,
        onCancelCreateIssue
    }
}

export default connect(mapStateToProps)(reduxForm({form:'new_issue_form'})(NewIssueForm))
