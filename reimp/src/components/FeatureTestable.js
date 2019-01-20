import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import {
    createFeatureTestable,
    ensureFeaturesLoaded,
    getFeature,
    is_feature_invalidated,
    addIssueToFeatureTestable,
    removeIssueToFeatureTestable
} from '../actions/Features'
import SidebarAddButton from './SidebarAddButton'
import { has_permission } from '../actions/Users'
import Testable from './Testable'
import ModalDialog from './ModalDialog'
import IssueSelectorForm from './form/IssueSelectorForm'
import IssueName from './IssueName'

class FeatureTestable extends Component {

    constructor(props) {
        super(props)
        this.state = {creatingIssueForTestable: false}
    }
    
    componentWillMount() {
        const { dispatch, feature_id } = this.props
        dispatch(ensureFeaturesLoaded([feature_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = this.props
        const { feature_id } = new_props
        dispatch(ensureFeaturesLoaded([feature_id]))
    }

    onCancelCreateIssueForTestable = () => {
        this.setState({creatingIssueForTestable: false})
    }

    createTestable = (evt) => {
        const { dispatch, feature_id } = this.props
        evt.stopPropagation()
        dispatch(createFeatureTestable(feature_id, [], null))
    }

    createIssueForTestable = (evt) => {
        evt.stopPropagation()
        this.setState({creatingIssueForTestable: true})
    }

    onRemoveIssueFromFeature = (evt, issue_id) => {
        const { dispatch, feature_id, testable } = this.props
        evt.stopPropagation()
        if ( ! window.confirm("Unassociate this issue from this testable?\n(The issue won't be deleted)") ) {
            return
        }
        dispatch(removeIssueToFeatureTestable(feature_id, testable.id, issue_id))
    }

    onCreatedIssueForTestable = (new_values) => {
        const { dispatch, feature_id, testable } = this.props
        const { issue_id } = new_values
        this.setState({creatingIssueForTestable: false})
        dispatch(addIssueToFeatureTestable(feature_id, testable.id, issue_id))
    }

    renderCreateIssueForTestable = () => {
        const { testable } = this.props
        return (
            <ModalDialog isOpen={true}
                         onClose={this.onCancelCreateIssueForTestable}
                         title={`Select issue for testable`}
                         variant="large">
              <div className="editable-property-modal__row editable-property-modal__row--header">
                <label className="editable-property-modal__title">
                  Select or create an issue for testable {testable.name}
                </label>
              </div>
              <IssueSelectorForm optional_default_issue_values={{issue_type:'issue'}}
                                 onSubmitted={this.onCreatedIssueForTestable}/>
            </ModalDialog>
        )
    }

    render() {
        const that = this
        const {testable, can_edit, project_id} = this.props
        const { creatingIssueForTestable } = this.state

        const extra_actions = [ {label: 'Link issue',
                                 onClick: this.createIssueForTestable} ]


        map(testable.implementing_issue_ids, (issue_id) => {
            extra_actions.push({onClick: null,
                                label: (
                                    <div>
                                      <IssueName issue_id={issue_id}/>
                                      <div className="issue__small-delete-image"
                                           onClick={(evt) => that.onRemoveIssueFromFeature(evt, issue_id)} />
                                    </div>
                                )})
        })
        
        return (
            <div>
              { creatingIssueForTestable && this.renderCreateIssueForTestable() }
              { testable.id && 
                <Testable testable={testable}
                          project_id={project_id}
                          can_edit={can_edit}
                          onDelete={this.onDelete}
                          extra_actions={extra_actions}
                />
              }
              { ! testable.id && 
                <div className="text-component--testable">
                  <SidebarAddButton label="Add testable"
                                    onButtonClick={that.createTestable} />
                </div>
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { feature_id, testable_id } = props
    const feature = getFeature(state, feature_id) || {}
    const can_edit = has_permission(state, feature.project_id, 'has_edit_description')

    let testable = { id: null}
    if ( testable_id ) {
        map(feature.testables || [], function(feature_testable, index) {
            if ( feature_testable.id === testable_id ) {
                testable = feature_testable
            }
        })
    }

    return {
        feature_id: feature_id,
        feature,
        sprint_id: feature.sprint_id,
        testable_id: testable_id,
        testable: testable,
        project_id: feature.project_id,
        is_invalidated: is_feature_invalidated(state, feature.id),
        can_edit
    }
}


export default connect(mapStateToProps)(FeatureTestable)
