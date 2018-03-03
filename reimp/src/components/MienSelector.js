import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import '../sass/mien-selector.css'
import {
    PAGE_KEY__ISSUES_PAGE,
} from '../actions/ItemListKeyRegistry'
import { setMien,
         getMien,
         MIENS
} from '../actions/Mien'
import classNames from 'classnames'

class MienSelector extends Component {

    constructor(props) {
        super(props)
        this.onChangeMien = this.onChangeMien.bind(this)
    }

    onChangeMien(mien) {
        const { dispatch } = this.props
        dispatch(setMien(mien))
    }

    render() {
        const button_class = "button mien-button"
        const { current_mien, available_miens } = this.props

        return (
            <div className="mien-select-panel">
              { map(available_miens, (mien) =>
                    <div key={mien} onClick={() => this.onChangeMien(mien) }
                         className={classNames(button_class, {'button--active': current_mien === mien})}>
                      {mien}
                    </div>
              )}
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const current_mien = getMien(state) || 'dev'
    const available_miens = MIENS

    return {
        current_mien,
        available_miens
    }
}

export default connect(mapStateToProps)(MienSelector)

