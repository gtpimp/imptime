import React, {Component} from 'react'
import {connect} from 'react-redux'
import Modal from 'react-modal';
import '../sass/modal-dialog.scss'
import classNames from 'classnames'
import PopupPanel from './PopupPanel'

class ModalDialog extends Component {

    render() {

        const { isOpen, onClose, title, variant, children } = this.props
        
        return (
            <Modal isOpen={isOpen || false}
                   className={classNames('modal-dialog', 'modal-dialog--' + variant)}
                   overlayClassName="modal-dialog__overlay"
                   onRequestClose={onClose || function () { }}
                   contentLabel={title}>
              <PopupPanel>
                <div className={classNames('modal-dialog__header', 'modal-dialog__header--' + variant)}>
                  <label htmlFor="assigned" className={classNames('modal-dialog__title', 'modal-dialog__title--' + variant)}>{title}</label>
                  { onClose &&
                    <div className="modal-dialog__close"><i className="material-icons" onClick={onClose || function () { }}>close</i></div>
                  }
                </div>
                <div className="modal-dialog__content">
                  {children}
                </div>
              </PopupPanel>
            </Modal>
        )
    }
}

function mapStateToProps(state, props) {

    const { onClose, isOpen, title, variant } = props
    
    return {
        onClose,
        isOpen: isOpen || true,
        variant: variant || 'default',
        title
    }
}

export default connect(mapStateToProps)(ModalDialog)
