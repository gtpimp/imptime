import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'

class CurrencyValue extends Component {

    render() {
        const { value, float_direction } = this.props

        var formatter = new Intl.NumberFormat('en-GB', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
            // style: 'currency',
            // currency: 'ZAR',
            // currencyDisplay: 'symbol',
        })
        const formatted_currency = formatter.format(value)
        
        return (
            <div className={classNames("currency_value", "currency_value--"+float_direction)}>
              R {formatted_currency}
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { value } = props
    let { float_direction } = props
    if ( float_direction === undefined  ) {
        float_direction = "right"
    }
    
    return {
        value: value,
        float_direction: float_direction
    }
}

export default connect(mapStateToProps)(CurrencyValue)

