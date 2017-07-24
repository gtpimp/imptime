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
                <div className={classNames('modal-dialog__header', 'modal-dialog__header--' + this.props.variant)}>
                    <label htmlFor="assigned" className={classNames('modal-dialog__title', 'modal-dialog__title--' + this.props.variant)}>{this.props.title}</label>
                    { this.props.onClose &&
                      <div className="modal-dialog__close"><i className="material-icons" onClick={this.props.onClose || function () { }}>close</i></div>
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
        variant: props.variant || 'default'
    }
}

export default connect(mapStateToProps)(ModalDialog)
