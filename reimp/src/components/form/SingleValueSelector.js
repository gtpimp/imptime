import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import filter from 'lodash/filter'
import {ensureUsersLoaded} from '../../actions/Users'
import '../../sass/single-value-selector.css'

export class SingleValueSelector extends Component {

    constructor(props) {
        super(props)
        this.onSelected = this.onSelected.bind(this)
        this.onSelectionFilterChanged = this.onSelectionFilterChanged.bind(this)
        this.onKeyDownOnSelectionFilter = this.onKeyDownOnSelectionFilter.bind(this)
    }

    onSelected(selected_option) {
        const {onChange} = this.props
        onChange(selected_option.value)
    }

    onSelectionFilterChanged() {
        this.setState({filter_term:this.selection_filter_el.value})
    }

    onKeyDownOnSelectionFilter(event) {
        const { onChange } = this.props
        if (event.keyCode === 13) {
            const options = this.getFilteredOptions()
            if ( options.length == 1 ) {
                onChange(options[0].value)
            } else {
                onChange(this.selection_filter_el.value)
            }
            event.stopPropagation()
            event.preventDefault()
        }
    }

    getOptionLabel(option) {
        return (option.index + 1) + ". " + option.label
    }

    getFilteredOptions() {
        const {options} = this.props
        const that = this
        const filter_term = (this.state || {}).filter_term || undefined
        let index = 0
        return filter(options, function(option) {
            option.index = index
            let res = false
            if ( filter_term === undefined || filter_term.length === 0 ) {
                res = true
            }

            if ( that.getOptionLabel(option).indexOf(filter_term) > -1 ) {
                res = true
            }
            index += 1
            return res
        })
    }

    render_suggestions() {
        const {options} = this.props
        const filter_term = (this.state || {}).filter_term || undefined
        const that = this

        const filtered_options = this.getFilteredOptions(options)
        const suggestions = map(filtered_options, function(option) {
            return (
                <div className="single-value-selector__suggestion" key={'suggestion_' + option.index}
                     onClick={() => that.onSelected(option)}>
                    <div className="single-value-selector__suggestion-number">
                        {(option.index + 1)}.
                    </div>
                    <div className="single-value-selector__suggestion-label">
                        {option.label}
                    </div>
                </div>
            )
        })
        return suggestions
    }

    render() {
        
        return (
            <div className="single-value-selector">
                <div className="single-value-selector__input-wrapper">
                    <input onKeyDown={this.onKeyDownOnSelectionFilter}
                           className="single-value-selector__input"
                           ref={(ref)=> this.selection_filter_el=ref}
                           onChange={this.onSelectionFilterChanged}/>
                </div>
                <div className="single-value-selector__suggestions">
                    {this.render_suggestions()}
                </div>
            </div>
        )
    }

}

function mapStateToProps(state, props) {

    const { options } = props

    return {
        options: options
    }
}

export default connect(mapStateToProps)(SingleValueSelector)
