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
import { setMienButton,
         getMienButton
} from '../actions/Settings'
import { setMien } from '../actions/Page'
import classNames from 'classnames'

class MienSelector extends Component {

    constructor(props) {
        super(props)
        this.onChangeMien = this.onChangeMien.bind(this)
    }

    onChangeMien(mien) {
        const { dispatch } = this.props
        dispatch(setMienButton(mien))
        dispatch(setMien(PAGE_KEY__ISSUES_PAGE, mien))
    }

    render() {
        const button_class = "button button--large mien-button"
        const { current_mien } = this.props

        return (
            <div className="mien-select-panel">
              <div onClick={() => this.onChangeMien(DEV_MIEN) }
                   className={ current_mien === DEV_MIEN ? classNames(button_class, 'button--active') : button_class }>
                Dev
              </div>
              <div onClick={() => this.onChangeMien(MANAGER_MIEN) }
                   className={ current_mien === MANAGER_MIEN ? classNames(button_class, 'button--active') : button_class }>
                Manager
              </div>
              <div onClick={() => this.onChangeMien(FINANCE_MIEN) }
                   className={ current_mien === FINANCE_MIEN ? classNames(button_class, 'button--active') : button_class }>
                Finance
              </div>
              <div onClick={() => this.onChangeMien(CLIENT_MIEN) }
                   className={ current_mien === CLIENT_MIEN ? classNames(button_class, 'button--active') : button_class }>
                Client
              </div>
              <div onClick={() => this.onChangeMien(TESTER_MIEN) }
                   className={ current_mien === TESTER_MIEN ? classNames(button_class, 'button--active') : button_class }>
                Tester
              </div>
              <div onClick={() => this.onChangeMien(SPEC_MIEN) }
                   className={ current_mien === SPEC_MIEN ? classNames(button_class, 'button--active') : button_class }>
                Spec
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const current_mien = getMienButton(state)

    return {
        current_mien: current_mien
    }
}

export default connect(mapStateToProps)(MienSelector)

