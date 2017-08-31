import React, {Component} from 'react'
import {connect} from 'react-redux'

class CurrencyValue extends Component {

    render() {
        const { value } = this.props

        var formatter = new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'ZAR',
            currencyDisplay: 'symbol',
            minimumFractionDigits: 2
        })
        const formatted_currency = formatter.format(value)
        
        return (
            <div className="currency_value">
              {formatted_currency}
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
