import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import '../sass/mien-selector.css'
import { getVisibleItemIds } from '../actions/ItemList'
import { setCurrentMienId,
         getCurrentMienId,
         MIENS,
         getMiens,
         fetchMiensIfNeeded,
         startCandidateMien,
         saveCandidateMien,
         updateCandidateTitle,
         cancelCandidateMien,
         getCandidateMien,
         deleteMiens
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
        this.hideButtonBar = this.hideButtonBar.bind(this)
        this.showButtonBar = this.showButtonBar.bind(this)
        this.hideEditButtons = this.hideEditButtons.bind(this)
        this.showEditButtons = this.showEditButtons.bind(this)
        this.state = { show_button_bar: false, show_edit_buttons: false}
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

    onCancelCreateCandidateMien() {
        const { dispatch } = this.props
        dispatch(cancelCandidateMien())
    }

    onSaveCandidateMien(new_values) {
        const { dispatch } = this.props
        dispatch(updateCandidateTitle(new_values.title))
        dispatch(saveCandidateMien())
    }

    deleteMien(event, mien) {
        const { dispatch } = this.props
        event.preventDefault()
        if (! confirm("Delete mien " + mien.title + "?") ) {
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
        this.setState({show_edit_buttons: true})
    }

    hideEditButtons() {
        this.setState({show_edit_buttons: false})
    }

    renderButtonBar() {
        const show_button_bar = this.state.show_button_bar
        const show_edit_buttons = this.state.show_edit_buttons
        
        return (
            <div className="mien-button-bar">
              { ! show_edit_buttons &&
                <div className="button toolbar-button--small button--primary" 
                     onClick={this.onCreateCandidateMien}>
                  + New Mien
                </div>
              }
              { ! show_edit_buttons &&
                <div className="button toolbar-button--small button--primary" 
                     onClick={this.showEditButtons}>
                  Edit
                </div>
              }
              { show_edit_buttons &&
                <div className="button toolbar-button--small button--primary"
                     onClick={this.hideEditButtons}>
                  Stop editing
                </div>
              }
            </div>
        )
    }

    render() {
        const button_class = "button mien-button"
        const { miens, current_mien_id, available_miens_names, candidate_mien } = this.props
        const is_creating_candidate_mien = candidate_mien || false
        const show_button_bar = this.state.show_button_bar
        const show_edit_buttons = this.state.show_edit_buttons

        return (
            <div className="mien-select-panel" onMouseLeave={this.hideButtonBar} onMouseOver={this.showButtonBar}>

              { map(miens, (mien) =>
                  <div key={mien.id} onClick={() => this.onChangeMien(mien.id) }
                       className={classNames(button_class, {'button--active': current_mien_id === mien.id})}>
                    {mien.title}
                    { show_edit_buttons &&
                      <div className="icon--small-delete" onClick={(event) => this.deleteMien(event, mien)}/>
                    }
                  </div>
              )}

              { map(available_miens_names, (mien_name) =>
                    <div key={mien_name} onClick={() => this.onChangeMien(mien_name) }
                         className={classNames(button_class, {'button--active': current_mien_id === mien_name})}>
                      {mien_name}
                    </div>
              )}
            
              { (show_button_bar || show_edit_buttons) && this.renderButtonBar() }
              { is_creating_candidate_mien &&
                <MienTitleForm onCancel={this.onCancelCreateCandidateMien}
                               onSubmitted={this.onSaveCandidateMien}/>
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const current_mien_id = getCurrentMienId(state) || 'dev'
    const available_miens_names = MIENS
    const mien_ids = getVisibleItemIds(state, LIST_KEY__MIEN_LIST)
    const miens = getMiens(state, mien_ids)
    const candidate_mien = getCandidateMien(state) || null

    return {
        current_mien_id,
        available_miens_names,
        candidate_mien,
        miens
    }
}

export default connect(mapStateToProps)(MienSelector)
