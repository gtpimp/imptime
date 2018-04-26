import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../sass/header.css'
import { logged_in_user } from '../actions/Auth'
import Navbar from '../components/Navbar'
import Toolbar from './toolbar/Toolbar'
import ReleaseNotesPopup from '../components/ReleaseNotesPopup'
import Maintenance from './Maintenance'
import Error from './Error'
import { updateHeaderHeight } from '../actions/Header'

class Header extends Component {
//    constructor(props) {
//        super(props)
        //this.checkHeaderHeight = this.checkHeaderHeight.bind(this)
//    }
    
    componentDidMount() {
        const { dispatch } = this.props
        const headerHeight = this.headerElem.clientHeight
        //console.log("X", headerHeight)
        dispatch(updateHeaderHeight(headerHeight))
        //this.checkHeaderHeight()
    }

//    checkHeaderHeight() {
//        const { header_height, dispatch } = this.props
//        const headerHeight = this.headerElem.clientHeight
//        if(header_height !== headerHeight) {
            //console.log("A", headerHeight)
            //dispatch(updateHeaderHeight(headerHeight))
//        }
//        
//    }
    
    render() {
        const { has_usable_password } = this.props
    //    this.checkHeaderHeight()
        return (
            <div className="header" ref={(header) => { this.headerElem = header }}>
              <Maintenance/>
              <Error/>
              <Navbar/>
              <Toolbar />
              { has_usable_password && 
                <ReleaseNotesPopup />
              }
            </div>
        )
    }
}

function mapStateToProps(state) {

    const user = logged_in_user()
    const has_usable_password = user['has_usable_password'] || false
    return {
        has_usable_password,
        header_height: state.primary_header.headerHeight
    }
}

export default connect(mapStateToProps)(Header)
