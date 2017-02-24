import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import Modal from 'react-modal';
import RIEInput from '../widgets/RIEInput'
import RIEModeToggler from '../widgets/RIEModeToggler'

import { addEstimate } from '../actions/Issues'

class EstimateEditor extends Component {

    constructor(props) {
        super(props)
        this.saveEstimate = this.saveEstimate.bind(this)
    }

    saveEstimate(raw_estimate) {
        const { dispatch, closeEstimateEditor, selected_ids } = this.props
        let estimate_hours = raw_estimate
        if ( estimate_hours.indexOf(":")>-1 ) {
            const parts = estimate_hours.split(":")
            estimate_hours = parseFloat(parts[0]) + parseFloat(parts[1])/60
        }
        
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

                     Enter in hours, using either a decimal point for fractions of an hour, or HH:MM

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
