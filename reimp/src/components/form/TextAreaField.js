import React, {Component} from 'react'
import TextareaAutosize from 'react-autosize-textarea'

class TextAreaField extends Component {

    render() {
        return <TextareaAutosize {...this.props} />
    }
}

export default TextAreaField
