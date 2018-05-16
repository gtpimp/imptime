import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import '../sass/mien-selector.css'
import { getVisibleItemIds } from '../actions/ItemList'
import Modal from 'react-modal'
import MienFeature from './MienFeature'
import { setCurrentMienId,
         getCurrentMienId,
         getMiens,
         fetchMiensIfNeeded,
         startCandidateMien,
         saveCandidateMien,
         updateCandidateTitle,
         cancelCandidateMien,
         getCandidateMien,
         deleteMiens,
         updateMienTitle,
         startMienConfigurer,
         stopMienConfigurer,
         isMienConfigurerActive,
         getMienBeingConfigured
} from '../actions/Mien'
import classNames from 'classnames'
import MienTitleForm from './form/MienTitleForm'
import { LIST_KEY__MIEN_LIST } from '../actions/ItemListKeyRegistry'

class MienSelector extends Component {

    constructor(props) {
        super(props)
        this.onChangeMien = this.onChangeMien.bind(this)
        this.onCreateCandidateMien = this.onCreateCandidateMien.bind(this)
        this.onCancelCreateCandidateMien = this.onCancelCreateCandidateMien.bind(this)
        this.onSaveCandidateMien = this.onSaveCandidateMien.bind(this)
        this.onStartEditingMien = this.onStartEditingMien.bind(this)
        this.onCancelEditingMien = this.onCancelEditingMien.bind(this)
        this.onSaveMienTitle = this.onSaveMienTitle.bind(this)
        this.hideButtonBar = this.hideButtonBar.bind(this)
        this.showButtonBar = this.showButtonBar.bind(this)
        this.hideEditButtons = this.hideEditButtons.bind(this)
        this.showEditButtons = this.showEditButtons.bind(this)
        this.state = { show_button_bar: false,
                       editing_mien: null }
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const {dispatch} = props
        dispatch(fetchMiensIfNeeded(LIST_KEY__MIEN_LIST))
    }

    onChangeMien(mien_id) {
        const { dispatch } = this.props
        dispatch(setCurrentMienId(mien_id))
    }

    onCreateCandidateMien() {
        const { dispatch } = this.props
        dispatch(startCandidateMien())
    }

    onCancelCreateCandidateMien(event) {
        const { dispatch } = this.props
        event.preventDefault()
        dispatch(cancelCandidateMien())
    }

    onSaveCandidateMien(new_values) {
        const { dispatch } = this.props
        dispatch(updateCandidateTitle(new_values.title))
        dispatch(saveCandidateMien())
    }

    onStartEditingMien(event, mien) {
        event.preventDefault()
        this.setState({editing_mien: mien})
    }

    onStartCopyingMien(event, mien) {
        const { dispatch } = this.props
        event.preventDefault()
        dispatch(startCandidateMien({title: mien.title + " Copy",
                                     clone_of_mien_id: mien.id}))
    }

    onCancelEditingMien(event) {
        event.preventDefault()
        this.setState({editing_mien: null})
    }

    onSaveMienTitle(new_values) {
        const { dispatch } = this.props
        dispatch(updateMienTitle(this.state.editing_mien.id, new_values.title))
        this.setState({editing_mien: null})
    }

    deleteMien(event, mien) {
        const { dispatch } = this.props
        event.preventDefault()
        if (! window.confirm("Delete mien " + mien.title + "?") ) {
            return
        }
        dispatch(deleteMiens([mien.id]))
    }

    showButtonBar() {
        this.setState({show_button_bar: true})
    }

    hideButtonBar() {
        this.setState({show_button_bar: false})
    }

    showEditButtons() {
        const { dispatch } = this.props
        dispatch(startMienConfigurer())
    }

    hideEditButtons() {
        const { dispatch } = this.props
        dispatch(stopMienConfigurer())
        this.hideButtonBar()
        this.setState({editing_mien: null})
    }

    renderButtonBar() {
        const { is_mien_configurer_active } = this.props
        
        return (
            <div className="mien-button-bar">
              { ! is_mien_configurer_active &&
                <div className="mien-button-bar__button button toolbar-button--large" 
                     onClick={this.onCreateCandidateMien}>
                  + New
                </div>
              }
              { ! is_mien_configurer_active &&
                <div className="mien-button-bar__button button toolbar-button--large" 
                     onClick={this.showEditButtons}>
                  Configure
                </div>
              }
              { is_mien_configurer_active &&
                <div className="mien-button-bar__button button toolbar-button--large"
                     onClick={this.hideEditButtons}>
                  Stop configuring
                </div>
              }
            </div>
        )
    }

    renderMienEditButtons(mien) {
        return (
            <div className="mien-editor-button-bar">
              <div className="mien-editor-button-bar__button icon--small-delete" onClick={(event) => this.deleteMien(event, mien)}/>
              <div className="mien-editor-button-bar__button icon--edit" onClick={(event) => this.onStartEditingMien(event, mien)}/>
              <div className="mien-editor-button-bar__button icon--copy" onClick={(event) => this.onStartCopyingMien(event, mien)}/>
            </div>
        )
    }

    renderMienCreator() {
        const { candidate_mien } = this.props
        return (
            <Modal isOpen={true}
                   className="editable-property-modal"
                   overlayClassName="editable-property-modal__overlay"
                   onRequestClose={this.onCancelCreateCandidateMien}
                   contentLabel="New Title">
              <MienTitleForm onCancel={this.onCancelCreateCandidateMien}
                             initial_value={candidate_mien.title}
                             onSubmitted={this.onSaveCandidateMien}/>
            </Modal>
        )
    }

    renderMienTitleEditor() {
        return (
            <Modal isOpen={true}
                   className="editable-property-modal"
                   overlayClassName="editable-property-modal__overlay"
                   onRequestClose={this.onCancelCreateCandidateMien}
                   contentLabel="Edit Title">
              <MienTitleForm onCancel={this.onCancelEditingMien}
                             initial_value={this.state.editing_mien.title}
                             onSubmitted={this.onSaveMienTitle}/>
            </Modal>
        )
    }

    renderMiens() {
        const { miens, current_mien_id, is_mien_configurer_active } = this.props
        const button_class = "button mien-button"
        return (
            <div className="mien-buttons">
              { map(miens, (mien) =>
                  <div key={mien.id} onClick={() => this.onChangeMien(mien.id) }
                       className={classNames(button_class, {'button--active': current_mien_id === mien.id})}>
                    {mien.title}
                    { is_mien_configurer_active && this.renderMienEditButtons(mien) }
                  </div>
                )}
            </div>
        )
    }

    renderDefaultMienConfigurer() {
        return (
            <div className="mien-selector__default_configurer">
              <MienFeature feature_name="costs">
                <div className="mien-selector__default_configurer__feature">
                  Show financial values (if allowed on the project)
                </div>
              </MienFeature>
            </div>
        )
    }

    render() {
        const { candidate_mien, is_mien_configurer_active } = this.props
        const is_creating_candidate_mien = candidate_mien || false
        const is_editing_mien_title = this.state.editing_mien || false
        const show_button_bar = this.state.show_button_bar

        return (
            <div className="mien-select-panel" onMouseLeave={this.hideButtonBar} onMouseOver={this.showButtonBar}>
              { this.renderMiens() }
              { (show_button_bar || is_mien_configurer_active) && this.renderButtonBar() }
              { is_creating_candidate_mien && this.renderMienCreator() }
              { is_editing_mien_title && this.renderMienTitleEditor() }
              { is_mien_configurer_active && this.renderDefaultMienConfigurer() }
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const current_mien_id = getCurrentMienId(state) || 'dev'
    const mien_ids = getVisibleItemIds(state, LIST_KEY__MIEN_LIST)
    const miens = getMiens(state, mien_ids)
    const candidate_mien = getCandidateMien(state) || null
    const is_mien_configurer_active = isMienConfigurerActive(state)
    const mien_being_configured = getMienBeingConfigured(state)

    return {
        current_mien_id,
        candidate_mien,
        miens,
        is_mien_configurer_active,
        mien_being_configured
    }
}

export default connect(mapStateToProps)(MienSelector)
