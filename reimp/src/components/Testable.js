import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map, join } from 'lodash'
import classNames from 'classnames'
import EditableTestableLine from './EditableTestableLine'
import EditableTestableName from './EditableTestableName'
import { ensureTestableLinesLoaded, getTestableLines } from '../actions/TestableLines'
import { bulkUpdateTestable } from '../actions/Testables'
import { cx, css } from 'emotion'
import {default_theme as theme} from '../theme/default'
import ModalDialog from './ModalDialog'
import BulkTestableForm from './form/BulkTestableForm'
 
class Testable extends Component {

    constructor(props) {
        super(props)
        this.state = {bulk_editing: false}
    }
    
    componentWillMount() {
        const { dispatch, testable } = this.props
        if ( testable.testable_line_ids ) {
            dispatch(ensureTestableLinesLoaded(testable.testable_line_ids))
        }
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, testable } = new_props
        if ( testable.testable_line_ids ) {
            dispatch(ensureTestableLinesLoaded(testable.testable_line_ids))
        }
    }

    startBulkEdit = (evt) => {
        this.setState({bulk_editing: true})
        if ( evt ) {
            evt.preventDefault()
        }
    }

    stopBulkEdit = (evt) => {
        this.setState({bulk_editing: false})
        if ( evt ) {
            evt.preventDefault()
        }
    }

    onSaveBulkEdit = (new_values) => {
        const { dispatch, testable } = this.props
        dispatch(bulkUpdateTestable(testable.id, new_values.name, new_values.steps))
        this.stopBulkEdit()
    }

    renderBulkEditor() {
        const { testable, testable_lines } = this.props

        const instructions = map(testable_lines, (line) => line.instruction)
        
        return (
            <ModalDialog isOpen={true}
                         onClose={this.stopBulkEdit}
                         title={"Bulk editing testable"}
                         variant="large">
              
              <BulkTestableForm initial_value={{steps:"- " + join(instructions, "\n- "),
                                                name:testable.name}}
                                onSubmitted={this.onSaveBulkEdit}
                                onCancel={this.stopBulkEdit}
              />
              
            </ModalDialog>
        )
    }
    
    render() {
        const { testable, onDelete, extra_actions, can_edit } = this.props
        const { bulk_editing } = this.state

        return (
            <div className="issue-testable">

              { bulk_editing && this.renderBulkEditor() }
              
              <div className="issue-testable__text" >
                <div className={div_testable_name}>
                  <EditableTestableName testable={testable}
                                        can_edit={can_edit} />
                </div>
                { map(testable.testable_line_ids, (testable_line_id) =>
                    <EditableTestableLine key={testable_line_id}
                                          testable_id={testable.id}
                                          can_edit={can_edit}
                                          testable_line_id={testable_line_id} />
                )}
                { can_edit && 
                  <EditableTestableLine testable_id={testable.id}
                                        can_edit={can_edit}
                                        testable_line_id={null} />
                }
              </div>

              <div className="issue-testable__info" >
                { testable.quality_error &&
                  <div className={classNames("issue_sidebar--textarea--readonly",
                                             {"issue-testable__quality_error":testable.quality_error})}>
                    <h1 className="issue-testable__testable-name">{testable.name}</h1>
                    { testable.quality_error &&
                      <div className="issue_testable__quality_error_reason">
                        Low quality testable: {testable.quality_error}
                      </div>
                    }
                  </div>      
                }
                  <div className="issue_sidebar__options">
                    { onDelete &&
                    <div onClick={onDelete} className={cx("issue_sidebar__options__left", css`cursor:pointer`)}>
                      <span className="issue_sidebar__options__spacer">|</span>
                      Remove
                    </div>
                    }
                    { extra_actions && map(extra_actions, (extraAction, index) => {
                          return (
                              <div key={`testable_extra_actions_${testable.id}_${index}`}
                                   onClick={extraAction.onClick}
                                   className={cx("issue_sidebar__options__left", css`cursor:pointer`)}>
                                <span className="issue_sidebar__options__spacer">|</span>
                                {extraAction.label}
                              </div>
                          )
                      }
                      )}
                    { can_edit && 
                     <div onClick={this.startBulkEdit} className={cx("issue_sidebar__options__left", css`cursor:pointer`)}>
                       <span className="issue_sidebar__options__spacer">|</span>
                       Bulk edit
                     </div>
                   }
                </div>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    
    const { project_id, testable, can_edit, onDelete, extra_actions } = props

    const testable_lines = testable.testable_line_ids && getTestableLines(state, testable.testable_line_ids)
    
    return {
        project_id,
        testable,
        can_edit, 
        onDelete,
        extra_actions,
        testable_lines
    }
}

export default connect(mapStateToProps)(Testable)

const div_testable_name = css`
font: ${theme.fonts.bold_large};
`
