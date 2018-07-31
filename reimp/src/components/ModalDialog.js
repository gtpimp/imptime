import React, {Component} from 'react'
import {connect} from 'react-redux'
import { css, cx } from 'emotion'
import Modal from 'react-modal';
import '../sass/modal-dialog.scss'
import classNames from 'classnames'
import PopupPanel from './PopupPanel'

const modal_dialog = css`border-radius: 2px;
                         box-shadow: 0 4px 12px 0 rgba(0,0,0,0.3);
                         box-sizing: border-box;
                         position: absolute;
                         top: 10%;
                         left: 40%;
                         max-height: 80%;
                         overflow-y: auto;
                         overflow-x: hidden;
                         outline: none; `

class ModalDialog extends Component {

    render() {

        const { isOpen, onClose, title, variant, children } = this.props
        
        return (
            <Modal isOpen={isOpen || false}
                   className={cx(modal_dialog, 'modal-dialog--' + variant)}
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
                <div>
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
