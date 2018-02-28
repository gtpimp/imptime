import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../sass/mien-selector.css'
import {
    PAGE_KEY__ISSUES_PAGE,
    DEV_MIEN,
    MANAGER_MIEN,
    FINANCE_MIEN,
    CLIENT_MIEN,
    TESTER_MIEN,
    SPEC_MIEN
} from '../actions/ItemListKeyRegistry'
import { setMien,
         getMien,
         updateMien
} from '../actions/Settings'
import classNames from 'classnames'

class MienSelector extends Component {

    constructor(props) {
        super(props)
        this.onChangeMien = this.onChangeMien.bind(this)
    }

    onChangeMien(mien) {
        const { dispatch } = this.props
        dispatch(setMien(mien))
        dispatch(updateMien(mien, PAGE_KEY__ISSUES_PAGE))
    }

    render() {
        const button_class = "button mien-button"
        const { current_mien } = this.props

        return (
            <div className="mien-select-panel">
              <div onClick={() => this.onChangeMien(DEV_MIEN) }
                   className={classNames(button_class, {'button--active': current_mien === DEV_MIEN})}>
                Dev
              </div>
              <div onClick={() => this.onChangeMien(MANAGER_MIEN) }
                   className={classNames(button_class, {'button--active': current_mien === MANAGER_MIEN})}>
                Manager
              </div>
              <div onClick={() => this.onChangeMien(FINANCE_MIEN) }
                   className={classNames(button_class, {'button--active': current_mien === FINANCE_MIEN})}>
                Finance
              </div>
              <div onClick={() => this.onChangeMien(CLIENT_MIEN) }
                   className={classNames(button_class, {'button--active': current_mien === CLIENT_MIEN})}>
                Client
              </div>
              <div onClick={() => this.onChangeMien(TESTER_MIEN) }
                   className={classNames(button_class, {'button--active': current_mien === TESTER_MIEN})}>
                Tester
              </div>
              <div onClick={() => this.onChangeMien(SPEC_MIEN) }
                   className={classNames(button_class, {'button--active': current_mien === SPEC_MIEN})}>
                Spec
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const current_mien = getMien(state) || DEV_MIEN

    return {
        current_mien: current_mien
    }
}

export default connect(mapStateToProps)(MienSelector)

