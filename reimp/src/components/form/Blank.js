import React, {Component} from 'react'
import {connect} from 'react-redux'

class Blank extends Component {

    render() {
        return (
            <div className="blank"></div>
        )
    }
}

function mapStateToProps(state, props) {
    return {
    }
}

export default connect(mapStateToProps)(Blank)

