import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'

class UserRate extends Component {

    render() {
        const { value, class_name } = this.props

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
            <div className={classNames("user_rate",
                                       {"user_rate--empty" :value==0})}>
              @R {formatted_currency}
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { value, class_name } = props

    return {
        value: value,
        class_name: class_name || "currency_value"
    }
}

export default connect(mapStateToProps)(UserRate)
