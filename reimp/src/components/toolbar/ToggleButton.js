import React, { Component } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import '../../sass/toggle-button.css'

class ToggleButton extends Component {

    constructor() {
        super()
        this.onClick = this.onClick.bind(this)
    }

    onClick(event) {
        const {onChange, value} = this.props

        if (onChange) {
            onChange(!value)
        }
    }

    render() {
        const { on_label, off_label, value} = this.props

        return (
            <div onClick={this.onClick} className={classNames("toggle-button", {"toggle-button--checked": value})}>
              {/* <div className="toggle-button__label">{off_label || "Off"}</div> */}
              <div className="toggle-button__input">
                <div className="toggle-button__label">{on_label || "On"}</div>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {}
}

export default connect(mapStateToProps)(ToggleButton)
