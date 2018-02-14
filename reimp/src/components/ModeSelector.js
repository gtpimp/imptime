import React, {Component} from 'react'
import {connect} from 'react-redux'
import Select from 'react-select'
import '../sass/mode-selector.css'
import {
    DEV_MODE_HEADER_LIST,
    MANAGER_MODE_HEADER_LIST,
    FINANCE_MODE_HEADER_LIST,
    CLIENT_MODE_HEADER_LIST,
    TESTER_MODE_HEADER_LIST,
    SPEC_MODE_HEADER_LIST
} from '../actions/ItemListKeyRegistry'

class ModeSelector extends Component {

    onChangeFilterSprintType(new_value) {
    }

    render() {

        const { mode_type } = this.props

        return (
            <div className="mode-selector">
              <Select className="mode-selector__options"
                      name='mode_type'
                      options={mode_type}
                      onChange={this.onChangeModeType}
              />
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const mode_type = [{value: "dev", label: "dev"}, {value: "tester", label: "tester"}]

    return {
        mode_type
    }
}

export default connect(mapStateToProps)(ModeSelector)
