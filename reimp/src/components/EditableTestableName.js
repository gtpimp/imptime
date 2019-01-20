import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import EditableProperty from './form/EditableProperty'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import {
    updateTestableName
} from '../actions/Testables'
import TestableNameForm from './form/TestableNameForm'
import { has_permission } from '../actions/Users'

class EditableTestableName extends Component {

    onChange(new_value) {
        const { dispatch, testable } = this.props
        dispatch(updateTestableName(testable.id, new_value.name))
    }

    render() {
        const {testable, can_edit} = this.props
        return (
            <div>
              { testable.id &&
                <EditableProperty property_key={'testable_'+testable.id}
                                  initial_value={testable.name}
                                  onChange={this.onChange}
                                  can_edit={can_edit}
                >
                  <TestableNameForm form={'testable_name_form_'+testable.id}
                                    testable={testable}/>
                  { testable.name }
                  <div className="text-component--empty"></div>
                </EditableProperty>
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { testable, can_edit } = props

    return {
        testable,
        can_edit
    }
}


export default connect(mapStateToProps)(EditableTestableName)
