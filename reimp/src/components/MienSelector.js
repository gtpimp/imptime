import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import '../sass/mien-selector.css'
import { setCurrentMienName,
         getCurrentMienName,
         MIENS,
         startCandidateMien,
         cancelCandidateMien,
         getCandidateMien
} from '../actions/Mien'
import classNames from 'classnames'
import MienTitleForm from './form/MienTitleForm'

class MienSelector extends Component {

    constructor(props) {
        super(props)
        this.onChangeMien = this.onChangeMien.bind(this)
        this.onCreateCandidateMien = this.onCreateCandidateMien.bind(this)
        this.onCancelCreateCandidateMien = this.onCancelCreateCandidateMien.bind(this)
        this.hideButtonBar = this.hideButtonBar.bind(this)
        this.showButtonBar = this.showButtonBar.bind(this)
        this.state = { show_button_bar: false}
    }

    onChangeMien(mien) {
        const { dispatch } = this.props
        dispatch(setCurrentMienName(mien))
    }

    onCreateCandidateMien() {
        const { dispatch } = this.props
        dispatch(startCandidateMien())
    }

    onCancelCreateCandidateMien() {
        const { dispatch } = this.props
        dispatch(cancelCandidateMien())
    }

    showButtonBar() {
        this.setState({show_button_bar: true})
    }

    hideButtonBar() {
        this.setState({show_button_bar: false})
    }

    render() {
        const button_class = "button mien-button"
        const { current_mien_name, available_miens_names, candidate_mien } = this.props
        const is_creating_candidate_mien = candidate_mien || false
        const show_button_bar = this.state.show_button_bar

        return (
            <div className="mien-select-panel" onMouseLeave={this.hideButtonBar} onMouseOver={this.showButtonBar}>
              { map(available_miens_names, (mien_name) =>
                    <div key={mien_name} onClick={() => this.onChangeMien(mien_name) }
                         className={classNames(button_class, {'button--active': current_mien_name === mien_name})}>
                      {mien_name}
                    </div>
              )}
              { show_button_bar && ! is_creating_candidate_mien && 
                <div className="mien-button-bar">
                  <div className="button toolbar-button--small button--primary" 
                       onClick={this.onCreateCandidateMien}>
                    + New Mien
                  </div>
                </div>
              }
              { is_creating_candidate_mien &&
                <MienTitleForm onCancel={this.onCancelCreateCandidateMien} />
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const current_mien_name = getCurrentMienName(state) || 'dev'
    const available_miens_names = MIENS
    const candidate_mien = getCandidateMien(state) || null

    return {
        current_mien_name,
        available_miens_names,
        candidate_mien
    }
}

export default connect(mapStateToProps)(MienSelector)
