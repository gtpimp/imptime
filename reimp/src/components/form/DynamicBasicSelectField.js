import React, { Component, Fragment } from 'react'
import Select from 'react-select'

class DynamicBasicSelectField extends Component {

    constructor(props) {
        super(props)
        this._onChange = this._onChange.bind(this)
        this._onInputChange = this._onInputChange.bind(this)
    }

    _onInputChange(value) {
        const { onInputChange } = this.props
        
        if (onInputChange) {
            onInputChange(value)
        }
    }

    _onChange(option) {
        const { input, value_key, onSelectOption } = this.props
        
        input.onChange(option[value_key || 'id'])

        if (onSelectOption) {
            onSelectOption(option)
        }

        if (option.onClick) {
            option.onClick(option)
        }
    }
    
    render() {
        const { meta, isDisabled, selectStyles, options,
                placeholder, name } = this.props

        return (
            <Fragment>
              <Select
                  cacheOptions={false}
                  name={name}
                  escapeClearsValue={true}
                  options={options}
                  onInputChange={this._onInputChange}
                  defaultValue={meta.initial}
                  isDisabled={isDisabled}
                  onChange={this._onChange}
                  placeholder={placeholder}
                  styles={selectStyles}
              />
              { meta.invalid && meta.error && meta.error }
            </Fragment>
        )
    }
}

export default DynamicBasicSelectField

