import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import Modal from 'react-modal';
import RIEInput from '../widgets/RIEInput'
import RIEModeToggler from '../widgets/RIEModeToggler'

import { addEstimate } from '../actions/Issue'

class EstimateEditor extends Component {

    constructor(props) {
        super(props)
        this.saveEstimate = this.saveEstimate.bind(this)
    }

    saveEstimate(raw_estimate) {
        const { dispatch } = this.props
        const estimate_hours = raw_estimate
        const {closeEstimateEditor, selected_ids} = this.props
        dispatch(addEstimate(selected_ids, estimate_hours, closeEstimateEditor))
    }

    render() {
        const {isOpen, closeEstimateEditor, selected_items} = this.props

        return (
            <Modal isOpen={isOpen}
                   onRequestClose={closeEstimateEditor}
                   contentLabel="Estimate editor">

                <h2>Edit estimates</h2>
                {map(selected_items, function(issue, index) {
                     return (
                         <div key={index}>
                             {issue.number}
                             {issue.subject}
                         </div>
                     )
                 })}

                     Enter in hours, using a decimal point for fractions of an hour.

                     <RIEModeToggler initialValue=""
                                     propName="raw_estimate"
                                     initialState="editing"
                                     onChange={this.saveEstimate}
                                     onCancel={closeEstimateEditor}>
                         <RIEInput/>
                     </RIEModeToggler>

            </Modal>
        )
    }
}

function mapStateToProps(state, props) {
    return {}
}

export default connect(mapStateToProps)(EstimateEditor)
