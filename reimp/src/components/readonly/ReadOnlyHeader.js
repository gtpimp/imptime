import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../../sass/header.scss'
import ReadOnlyNavbar from './ReadOnlyNavbar'

class ReadOnlyHeader extends Component {

    render() {
        
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
