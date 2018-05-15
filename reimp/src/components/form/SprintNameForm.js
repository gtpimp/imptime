import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field, formValueSelector } from 'redux-form';
import Textarea from 'react-expanding-textarea'
import '../../sass/text-component.scss'
import Modal from 'react-modal'

class SprintNameForm extends Component {

    constructor(props) {
        super(props)

        this.state = {
            isModalOpen: false
        }
        
        this.renderTextarea = this.renderTextarea.bind(this)
        this.cancelIfValid = this.cancelIfValid.bind(this)
        this.toggleModal = this.toggleModal.bind(this)
    }

    toggleModal() {
        const { isModalOpen } = this.state
        this.setState({ isModalOpen: !isModalOpen }) 
    }
    
    cancelIfValid(event) {
        event.preventDefault()
        const { onCancel, textAreaValue } = this.props
        
        if (textAreaValue === undefined || textAreaValue === "") {
            onCancel()
        } else {
            console.log("unsaved changes")
            this.toggleModal()
        }
    }

    confirmCancel() {
        const { onCancel } = this.props
        this.toggleModal()
        onCancel()
    }
    
    renderTextarea(field) {
        const {input} = field
        return (
            <Textarea
                rows="1"
                maxLength="300"
                className="textarea textarea--text-component"
                placeholder="Name"
                onChange={input.onChange}
                value={input.value}
            />
        )
    }

    render() {
        const { handleSubmit, onCancel } = this.props
        const { isModalOpen } = this.state
        
        return (
            
            <form onSubmit={handleSubmit}>
              <div>
                <Field name="name"
                       component={this.renderTextarea} />
                <button type="submit">Submit</button>
                <button type="button" onClick={(e) => this.cancelIfValid(e)}>Cancel</button>
              </div>

              <Modal 
                  isOpen={ isModalOpen }
                  className="sprint_name-modal"
                  overlayClassName="sprint_name-modal__overlay"
                  contentLabel="Test"
                  onRequestClose={this.toggleModal}>
                <div className="sprint_name-modal__row sprint_name-modal__row--header">
                  <label htmlFor="assigned" className="sprint_name-modal__title">Are you sure you want to cancel?</label>
                  <div className="sprint_name-modal__close">
                    <i className="material-icons" onClick={this.toggleModal}>close</i>
                  </div>
                </div>
                <div className="sprint_name-modal__content">
                  <button type="button" onClick={() => this.toggleModal()}>No</button>
                  <button type="button" onClick={() => this.confirmCancel()}>Yes</button>
                </div>
              </Modal>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted, onCancel } = props

    const selector = formValueSelector('sprint_name_form')
    
    return {
        initialValues: {name:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        onCancel: onCancel,
        textAreaValue: selector(state, 'name')
    }
}

export default connect(mapStateToProps)(reduxForm({form:'sprint_name_form'})(SprintNameForm))
