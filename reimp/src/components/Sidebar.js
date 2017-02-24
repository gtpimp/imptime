import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../sass/sidebar.scss'

class Sidebar extends Component {

    render() {

        return (
            <div className="sidebar">
                {this.props.children}
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {

    }
}

export default connect(mapStateToProps)(Sidebar)

