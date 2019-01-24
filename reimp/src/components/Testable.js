import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import RenderedMarkdown from './RenderedMarkdown'
import classNames from 'classnames'
import EditableTestableLine from './EditableTestableLine'
import EditableTestableName from './EditableTestableName'
import { ensureTestableLinesLoaded } from '../actions/TestableLines'
import { cx, css } from 'emotion'
 
class Testable extends Component {

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
    
    render() {
        const { testable, onDelete, extraActions, can_edit } = this.props

        return (
            <div className="issue-testable">

              <div className="issue-testable__text" >
                <div>
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

                !!old!!
                <RenderedMarkdown content={testable.enriched_steps || testable.steps} />
                !! old!!
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
                  { extraActions && map(extraActions, (extraAction, index) => {
                      return (
                          <div key={`testable_extra_actions_${testable.id}_${index}`}
                               onClick={extraAction.onClick}
                               className="issue_sidebar__options__left">
                            <span className="issue_sidebar__options__spacer">|</span>
                            {extraAction.label}
                          </div>
                          )
                    }
                  )}
                </div>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    
    const { project_id, testable, can_edit, onDelete, extraActions } = props
    
    return {
        project_id,
        testable,
        can_edit, 
        onDelete,
        extraActions
    }
}

export default connect(mapStateToProps)(Testable)
