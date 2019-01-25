import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import SidebarAddButton from './SidebarAddButton'
import TestableLineForm from './form/TestableLineForm'
import TestableLine from './TestableLine'
import Loading from './Loading'
import {
    getTestableLine,
    ensureTestableLinesLoaded,
    updateTestableLines,
    createTestableLine,
    deleteTestableLine,
    is_testable_line_invalidated
} from '../actions/TestableLines'

class EditableTestableLine extends Component {

    componentWillMount() {
        const { dispatch, testable_line_id } = this.props
        dispatch(ensureTestableLinesLoaded([testable_line_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = this.props
        const { testable_line_id } = new_props
        dispatch(ensureTestableLinesLoaded([testable_line_id]))
    }

    onChange = (new_value) => {
        const { dispatch, testable_id, testable_line_id } = this.props
        if ( testable_line_id ) {
            dispatch(updateTestableLines([testable_line_id], new_value.instruction))
        } else {
            dispatch(createTestableLine(testable_id, new_value.instruction, null))
        }
    }

    onCreateLine = (position) => {
        const { dispatch, testable_id } = this.props
        dispatch(createTestableLine(testable_id, null, position))
    }

    onDelete = (event) => {
        const { dispatch, testable_line_id } = this.props
        event.stopPropagation()
        if (! window.confirm("Are you sure you want to delete this testable line?" ) ) {
            return false;
        }
        dispatch(deleteTestableLine(testable_line_id))
    }

    render()
    {
        const {testable_line_id, testable_line, testable_id, can_edit, project_id} = this.props

        if ( testable_line_id && (! testable_line || ! testable_line.id) ) {
            return <Loading/>
        }
        
        return (

            <PermissionInspectorHighlighter project_id={project_id}
                                            permission_name='has_edit_description'>
              { testable_line_id &&
                <EditableProperty property_key={'issue_testable_line_'+testable_line_id}
                                  initial_value={testable_line}
                                  onChange={this.onChange}
                                  can_edit={can_edit}
                >
                  <TestableLineForm form={'testable_line_form_'+testable_line_id}
                                    testable_line={testable_line}/>
                  <TestableLine testable_line={testable_line}
                                onDelete={this.onDelete}
                                onCreateLine={this.onCreateLine}
                  />
                  <div className="text-component--empty"></div>
                </EditableProperty>
              }

              <div className="issue-testable__button-bar">
                { ! testable_line_id &&
                  <div className="issue-testable__button-bar__container">
                    <EditableProperty property_key={'testable_line_create_'+testable_id}
                                      initial_value=''
                                      onChange={this.onChange}
                                      can_edit={can_edit}
                      >
                      <TestableLineForm form={'testable_line_form_create'} />
                      <div className="text-component--readonly"></div>
                      <div className="text-component--empty">
                        <div className="text-component--testable">
                          <SidebarAddButton label="Add testable line" />
                        </div>
                      </div>
                    </EditableProperty>
                  </div>
                }

              </div>
            </PermissionInspectorHighlighter>
        )
    }
}

function mapStateToProps(state, props) {

    const { project_id, can_edit, testable_id, testable_line_id } = props
    const testable_line = getTestableLine(state, testable_line_id)
    
    return {
        project_id,
        testable_line_id,
        testable_line,
        can_edit,
        testable_id,
        is_invalidated: is_testable_line_invalidated(state, testable_line_id),
    }
}


export default connect(mapStateToProps)(EditableTestableLine)
