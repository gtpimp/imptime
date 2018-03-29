import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Field } from 'redux-form';
import Textarea from 'react-expanding-textarea'
import '../../sass/text-component.scss'

class WikiNameField extends Component {

    constructor(props) {
        super(props)
        this.renderTextarea = this.renderTextarea.bind(this)
    }

    componentDidMount() {
        this.name_el && this.name_el.focus()
    }


    renderTextarea(field) {
        const { onKeyDown } = this.props
        const {input, data, onChange, ...rest} = field
        return (
            <input
                onKeyDown={onKeyDown}
                maxLength="300"
                className="generic-field--wide"
                placeholder="Name"
                onChange={input.onChange}
                value={input.value}
                ref={(ref)=> this.name_el=ref}
            />
        )
    }

    render() {
        return (
            <div className="wiki_sidebar--textarea">
              <Field name="name"
                     component={this.renderTextarea} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { onChange, onKeyDown } = props

    return {
        onChange,
        onKeyDown
    }
}

export default connect(mapStateToProps)(WikiNameField)
