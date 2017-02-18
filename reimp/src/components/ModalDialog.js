import React, {Component} from 'react'
import {connect} from 'react-redux'
import Modal from 'react-modal';
import '../sass/modal-dialog.scss'
import classNames from 'classnames'

class ModalDialog extends Component {

    render() {
        const {} = this.props

        return (
            <Modal isOpen={this.props.isOpen || false}
                   className={classNames('modal-dialog', 'modal-dialog--' + this.props.variant)}
                   overlayClassName="modal-dialog__overlay"
                   onRequestClose={this.props.onClose || function () { }}
                   contentLabel={this.props.title}>
                <div className="modal-dialog__row modal-dialog__row--header">
                    <label htmlFor="assigned" className="modal-dialog__title">{this.props.title}</label>
                    { this.props.onClose &&
                    <div className="modal-dialog__close"><i className="material-icons">close</i></div>
                    }
                </div>
                <div className="modal-dialog__content">
                    {this.props.children}
                </div>
            </Modal>
        )
    }
}

function mapStateToProps(state, props) {
    return {
        format: props.format || 'default'
    }
}

export default connect(mapStateToProps)(ModalDialog)
