import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../sass/mode-selector.css'
import {
    DEV_MODE,
    MANAGER_MODE,
    FINANCE_MODE,
    CLIENT_MODE,
    TESTER_MODE,
    SPEC_MODE
} from '../actions/ItemListKeyRegistry'
import { setProjectModeType,
         getProjectModeType
} from '../actions/Projects'
import classNames from 'classnames'

class ModeSelector extends Component {

    constructor(props) {
        super(props)
        this.onChangeModeType = this.onChangeModeType.bind(this)
    }

    onChangeModeType(mode_type) {
        const { dispatch } = this.props
        dispatch(setProjectModeType(mode_type))
    }

    render() {
        const button_class = "button button--large mode-button"
        const { current_mode } = this.props

        return (
            <div className="mode-select-panel">
              <div onClick={() => this.onChangeModeType(DEV_MODE) }
                   className={ current_mode === DEV_MODE ? classNames(button_class, 'button--active') : button_class }>
                Dev
              </div>
              <div onClick={() => this.onChangeModeType(MANAGER_MODE) }
                   className={ current_mode === MANAGER_MODE ? classNames(button_class, 'button--active') : button_class }>
                Manager
              </div>
              <div onClick={() => this.onChangeModeType(FINANCE_MODE) }
                   className={ current_mode === FINANCE_MODE ? classNames(button_class, 'button--active') : button_class }>
                Finance
              </div>
              <div onClick={() => this.onChangeModeType(CLIENT_MODE) }
                   className={ current_mode === CLIENT_MODE ? classNames(button_class, 'button--active') : button_class }>
                Client
              </div>
              <div onClick={() => this.onChangeModeType(TESTER_MODE) }
                   className={ current_mode === TESTER_MODE ? classNames(button_class, 'button--active') : button_class }>
                Tester
              </div>
              <div onClick={() => this.onChangeModeType(SPEC_MODE) }
                   className={ current_mode === SPEC_MODE ? classNames(button_class, 'button--active') : button_class }>
                Spec
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const current_mode = getProjectModeType(state)

    return {
        current_mode: current_mode
    }
}

export default connect(mapStateToProps)(ModeSelector)

