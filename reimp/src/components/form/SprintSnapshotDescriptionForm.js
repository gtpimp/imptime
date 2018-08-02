import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm } from 'redux-form';
import SprintSnapshotDescriptionField from './SprintSnapshotDescriptionField';

class SprintSnapshotDescriptionForm extends Component {

    render() {
        const { handleSubmit, onKeyDown, onCancel } = this.props

        return (
            <form onSubmit={handleSubmit}>
              <div>
                <SprintSnapshotDescriptionField onKeyDown={onKeyDown} />
                <div>
                  <button className="button" type="submit">Submit</button>
                  <button className="button" onClick={onCancel}>Cancel</button>
                </div>
              </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted, onKeyDown, onCancel } = props

    return {
        initialValues: {title:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        onCancel,
        onKeyDown
        
    }
}

export default connect(mapStateToProps)(reduxForm({form:'sprint_snapshot_title_form'})(SprintSnapshotDescriptionForm))

