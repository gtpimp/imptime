import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import '../sass/property-stack.css'
class PropertyStack extends Component {

    render() {
        return (
            <div className="property-stack">{this.props.children}</div>
        )
    }
}

function mapStateToProps(state, props) {
    return {
    }
}


export default connect(mapStateToProps)(PropertyStack)