import React, {Component} from 'react'
import {connect} from 'react-redux'
import { concat, partition, sortBy } from 'lodash'
import { Field, reduxForm } from 'redux-form'
import { getSprints, fetchSprintsIfNeeded } from '../../actions/Sprints'
import {
    initList,
    update_list_filter,
    invalidateList
} from '../../actions/ItemList'
import IssueParentGroupSelectorField from './IssueParentGroupSelectorField'

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
        const { handleSubmit, sprint_options, project_id } = this.props
        return (
            <form onSubmit={handleSubmit}>
              <div>
                <IssueParentGroupSelectorField onChange={this.onChangeAndSubmit}
                                               project_id={project_id} />
              </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {
    const { item_list } = state
    const { onSubmitted, project_id } = props
    
    return {
        initialValues: {sprint_id:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        project_id
    }
}

export default connect(mapStateToProps)(reduxForm({form:'select_sprint_form'})(SelectSprintForm))

