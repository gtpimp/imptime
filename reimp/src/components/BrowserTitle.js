import React, {Component} from 'react'

class BrowserTitle extends Component {

    constructor(props) {
        super(props)
        document.title = props.title
    }
    
    render() {
        return null
    }
    
}

export default BrowserTitle

