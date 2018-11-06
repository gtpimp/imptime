import React, { Component } from 'react'
import { css } from 'react-emotion'
import { default_theme as theme } from '../../theme/default'

class InputField extends Component {
    render() {
        const { InputElement, className, placeholder, input, label, type, meta: { touched, error, warning }, ...extraProps } = this.props
        const { checkboxLabel } = this.props
        const { value, onChange } = this.props.input
        return (
            <input {...input}
                   {...extraProps}
                   placeholder={placeholder}
                   className={ input_style }
                   type={type} />
        )
    }
}
export default InputField;

const input_style = css`
font: ${theme.fonts.regular_input};
background-color: ${theme.colours.white};
border-left: 0;
border-right: 0;
border-top: 0;
border-bottom: 1px solid ${theme.colours.input_border};
color: ${theme.colours.normal_text};
box-sizing: border-box;
height: 40px;
line-height: 24px;
outline: none;
padding-left: 0;
padding-right: 0;
padding-top: 8px;
padding-bottom: 14px;
width: 100%;
`
