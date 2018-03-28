import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../../sass/header.css'
import ReadOnlyNavbar from './ReadOnlyNavbar'

class ReadOnlyHeader extends Component {

    render() {
        const { has_usable_password } = this.props
        
        return (
            <div className="header">
              <ReadOnlyNavbar/>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {}
}

export default connect(mapStateToProps)(ReadOnlyHeader)
