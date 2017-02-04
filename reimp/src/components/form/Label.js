import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'

class Label extends Component {

    render() {
        const { value } = this.props
        return (
            <div>{value}</div>
        )
    }
}

function mapStateToProps(state, props) {
    return {
        value: props.value
    }
}

export default connect(mapStateToProps)(Label)

