import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Field } from 'redux-form';
import '../../sass/text-component.scss'

class IssueTitleField extends Component {

    constructor(props) {
        super(props)
        this.renderTextarea = this.renderTextarea.bind(this)
    }

    componentDidMount() {
        this.title_el && this.title_el.focus()
    }


    renderTextarea(field) {
        const { onKeyDown } = this.props
        const {input} = field
        return (
            <input
                onKeyDown={onKeyDown}
                maxLength="300"
                className="textarea textarea--text-component textarea--title"
                placeholder="Title"
                onChange={input.onChange}
                value={input.value}
                ref={(ref)=> this.title_el=ref}
            />
        )
    }

    render() {
        return (
            <div className="issue_sidebar--textarea">
              <Field name="title"
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

export default connect(mapStateToProps)(IssueTitleField)
