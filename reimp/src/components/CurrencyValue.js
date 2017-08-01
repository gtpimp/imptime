import React, {Component} from 'react'
import {connect} from 'react-redux'

class CurrencyValue extends Component {

    render() {
        const { value } = this.props
        return (
            <div className="currency_value">
              R{value}
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { value } = props

    return {
        value: value
    }
}

export default connect(mapStateToProps)(CurrencyValue)
