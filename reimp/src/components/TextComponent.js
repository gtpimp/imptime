import React, {Component} from 'react'
import {connect} from 'react-redux'
import Textarea from 'react-expanding-textarea'
import '../sass/text-component.scss'

class TextComponent extends Component {

    handleChange(e) {
        const {onChange} = this.props
        if (onChange) {
            onChange(e)
        }
    }

    renderView() {
        const {value} = this.props
        return (
            <div className="text-component--readonly">{value}</div>
        )
    }

    renderEmptyState() {
        const {placeholder} = this.props
        return (
            <div className="text-component--empty">{placeholder}</div>
        )
    }

    renderEdit() {
        const {placeholder, value} = this.props
        return (
            <div className="text-component--edit">
                  <Textarea
                      rows="1"
                      maxLength="3000"
                      className="textarea textarea--text-component"
                      placeholder={placeholder}
                      onChange={ this.handleChange }
                      value={value} />
            </div>
        )
    }

    render() {
        const {mode} = this.props
        return (
            <div className="text-component__wrapper">
                { mode === 'view-value' &&
                this.renderView()
                }
                { mode === 'view-empty-state' &&
                this.renderEmptyState()
                }
                { mode === 'edit' &&
                this.renderEdit()
                }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {}
}


export default connect(mapStateToProps)(TextComponent)
