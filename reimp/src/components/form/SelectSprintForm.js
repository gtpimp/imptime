import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm } from 'redux-form'
import SprintSelectorField from './SprintSelectorField'

class SelectSprintForm extends Component {

    constructor(props) {
        super(props)
        this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this)
    }

    onChangeAndSubmit(sprint) {
        const {handleSubmit} = this.props
        setTimeout(() => handleSubmit(), 0)
    }
    
    render() {
        const { handleSubmit, project_id } = this.props
        return (
            <form onSubmit={handleSubmit}>
              <div>
                <SprintSelectorField onChange={this.onChangeAndSubmit}
                                     project_id={project_id} />
              </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {
    const { onSubmitted, project_id } = props
    
    return {
        initialValues: {sprint_id:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        project_id
    }
}

export default connect(mapStateToProps)(reduxForm({form:'select_sprint_form'})(SelectSprintForm))

