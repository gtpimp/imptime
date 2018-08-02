import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Field } from 'redux-form';
import '../../sass/text-component.scss'

class SprintSnapshotDescriptionField extends Component {

    constructor(props) {
        super(props)
        this.renderTextarea = this.renderTextarea.bind(this)
    }

    componentDidMount() {
        this.description_el && this.description_el.focus()
    }

    renderTextarea(field) {
        const { onKeyDown } = this.props
        const {input} = field
        return (
            <input
                onKeyDown={onKeyDown}
                maxLength="300"
                className="textarea textarea--text-component textarea--description"
                placeholder="Description"
                onChange={input.onChange}
                value={input.value}
                ref={(ref)=> this.description_el=ref}
            />
        )
    }

    render() {
        return (
            <div>
              <Field name="description"
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

export default connect(mapStateToProps)(SprintSnapshotDescriptionField)
