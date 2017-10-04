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

    setLabel() {
        const { value, on_label, off_label } = this.props
        
        let label
        if (value) {
            label = on_label || "on"
        } else {
            label = off_label || "off"
        }
        
        return label
    }
    
    render() {
        const { value } = this.props

        const label = this.setLabel()
        
        return (
            <div onClick={this.onClick} className={classNames("toggle-button", {"toggle-button--checked": value})}>
              <div className="toggle-button__input">
                <div className="toggle-button__label">{label}</div>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {}
}

export default connect(mapStateToProps)(ToggleButton)
