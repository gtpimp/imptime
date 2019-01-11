import React, {Component} from 'react'
import {connect} from 'react-redux'
import { css, cx } from 'emotion'
import Modal from 'react-modal';
import '../sass/modal-dialog.scss'
import classNames from 'classnames'
import PopupPanel from './PopupPanel'
import {default_theme as theme} from '../theme/default'

const modal_dialog = css`border-radius: 2px;
                         font:${theme.fonts.regular_normal};
                         box-shadow: 0 4px 12px 0 rgba(0,0,0,0.3);
                         box-sizing: border-box;
                         position: absolute;
                         top: 10%;
                         max-height: 80%;
                         overflow-y: auto;
                         overflow-x: hidden;
                         outline: none; `

const modal_dialog_default = css`left: 40%; width:20%;`
const modal_dialog_large = css`left: 25%; width:50%;`
const modal_dialog_medium = css`left: 33%; width:33%;`
const modal_dialog_full = css`left: 20%; width:60%; height:100%;`
const modal_dialog_largest = css`left: 2%; width:96%; height:96%; max-height:96%; top:2%`
const modal_dialog_fixed = css`left: 20%; width:60%; height:400px;`

const popup_panel_left = css`display:flex; width:50%`
const popup_panel_right = css`display:flex; 
                              width:50%; 
                              justify-content:flex-end;
                              align-items: center`

class ModalDialog extends Component {

    render() {
        const { isOpen, onClose, title, variant, children, extra_buttons } = this.props
        
        return (
            <Modal isOpen={isOpen || false}
                   className={cx(modal_dialog,
                                 variant==="default" ? modal_dialog_default : null,
                                 variant==="large" ? modal_dialog_large : null,
                                 variant==="medium" ? modal_dialog_medium : null,
                                 variant==="fixed" ? modal_dialog_fixed : null,
                                 variant==="full" ? modal_dialog_full : null,
                                 variant==="largest" ? modal_dialog_largest : null)}
                   overlayClassName="modal-dialog__overlay"
                   onRequestClose={onClose || function () { }}
                   contentLabel={title}>
              <PopupPanel>
                <div className={classNames('modal-dialog__header', 'modal-dialog__header--' + variant)}>
                  <div className={popup_panel_left}>
                    <label htmlFor="assigned" className={classNames('modal-dialog__title', 'modal-dialog__title--' + variant)}>{title}</label>
                  </div>
                  <div className={popup_panel_right}>
                    {
                        extra_buttons && extra_buttons
                    }
                    { onClose &&
                      <div className="modal-dialog__close"><i className="material-icons" onClick={onClose || function () { }}>close</i></div>
                    }
                  </div>
                </div>
                <div className={css`height:100%`}>
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
        isOpen: isOpen,
        variant: variant || 'default',
        title
    }
}

export default connect(mapStateToProps)(ModalDialog)

