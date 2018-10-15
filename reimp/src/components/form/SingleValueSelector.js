import React, {Component} from 'react'
import {connect} from 'react-redux'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import { map, filter, includes, keys, keyBy, find, size } from 'lodash'
import { optionSelected, getBestOptions } from '../../actions/OptionRemember'
import '../../sass/single-value-selector.css'

export class SingleValueSelector extends Component {

    constructor(props) {
        super(props)
        this.onSelected = this.onSelected.bind(this)
        this.onSelectionFilterChanged = this.onSelectionFilterChanged.bind(this)
        this.onKeyDownOnSelectionFilter = this.onKeyDownOnSelectionFilter.bind(this)
        this.state = {filter_term: null,
                      show_options: false}
    }

    onSelected(selected_option) {
        const {dispatch, onChange, rememberer_key} = this.props
        dispatch(optionSelected(rememberer_key, selected_option.value))
        this.setState({filter_term: selected_option.label})
        this.setState({show_options:false})
        onChange(selected_option.value)
    }

    componentDidMount() {
        const { auto_focus } = this.props
        if ( auto_focus ) {
            this.selection_filter_el && this.selection_filter_el.focus()
            this.setState({show_options: true})
        } else {
            const is_focused = this.selection_filter_el && document.activeElement === ReactDOM.findDOMNode(this.selection_filter_el)
            this.setState({show_options: is_focused})
        }
    }
    
    onSelectionFilterChanged() {
        const { onFilterChanged } = this.props
        const new_filter_value = this.selection_filter_el.value
        this.setState({filter_term: new_filter_value})
        if ( onFilterChanged ) {
            onFilterChanged(new_filter_value)
        }
    }

    onFocusFilter = () => {
        this.setState({show_options: true})
    }

    onKeyDownOnSelectionFilter(event) {
        const { onChange } = this.props
        if (event.keyCode === 13) {
            const options = this.getFilteredOptions()
            if ( options.length === 1 ) {
                onChange(options[0].value)
            } else {
                onChange(this.selection_filter_el.value)
            }
            event.stopPropagation()
            event.preventDefault()
            this.setState({show_options:false})
        }
    }

    getOptionLabel(option) {
        return " " + (option.index + 1) + ". " + option.label
    }

    getFilteredOptions() {
        const {options} = this.props
        const that = this
        const filter_term = (this.state || {}).filter_term || undefined
        const filter_lower = (filter_term || "").toLowerCase()
        let option_lower = ""
        let index = 0
        return filter(options, function(option) {
            option.index = index
            let res = false
            if ( filter_term === undefined || filter_term.length === 0 ) {
                res = true
            }
            option_lower = (that.getOptionLabel(option) || "").toLowerCase()
                
            if ( option_lower.indexOf(filter_lower) > -1 ) {
                res = true
            }
            index += 1
            return res
        })
    }

    render_best_suggestions() {
        const { options, best_options } = this.props
        const that = this

        const available_option_values = keys(keyBy(options, "value"))
        
        const best_available_options = filter(best_options, best_option => includes(available_option_values, best_option.option))
        const enriched_best_available_options = map(best_available_options, function(best_option) {
            const option = find(options, function(option) {
                return option.value === best_option.option
            })
            return option
        })
        const suggestions = map(enriched_best_available_options, function(option, index) {
            return (
                <div className="single-value-selector__suggestion"
                     key={index}
                     onClick={() => that.onSelected(option)}
                >
                  <div className="single-value-selector__suggestion-label">
                    {option.label}
                  </div>
                </div>
            )
        })
        return suggestions
    }

    render_suggestions() {
        const {options, value} = this.props
        const that = this

        const filtered_options = this.getFilteredOptions(options)
        const suggestions = map(filtered_options, function(option, index) {
            return (
                <div className={classNames("single-value-selector__suggestion",
                                           {"single-value-selector__suggestion--selected":value===option.value})}
                     key={index}
                     onClick={() => that.onSelected(option)}
                >
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
        const { placeholder } = this.props
        const { filter_term, show_options } = this.state

        return (
            <div className="single-value-selector" >
                <div className="single-value-selector__input-wrapper">
                  <input onKeyDown={this.onKeyDownOnSelectionFilter}
                         onFocus={this.onFocusFilter}
                         placeholder={placeholder}
                         value={filter_term}
                         className="single-value-selector__input"
                         ref={(ref)=> this.selection_filter_el=ref}
                         onChange={this.onSelectionFilterChanged}/>
                </div>
                { show_options && 
                  <div className="single-value-selector__best-suggestions">
                    {this.render_best_suggestions()}
                  </div>
                }
                { show_options && 
                  <div className="single-value-selector__suggestions">
                    { this.render_suggestions()}
                  </div>
                }
            </div>
        )
    }

}

function mapStateToProps(state, props) {

    const { options, value, auto_focus, placeholder, rememberer_key,
            onFilterChanged } = props

    const best_options = getBestOptions(state, rememberer_key)
    
    return {
        options: options,
        value,
        auto_focus: auto_focus !== false,
        placeholder: placeholder || "",
        rememberer_key: rememberer_key || placeholder,
        best_options,
        onFilterChanged
    }
}

export default connect(mapStateToProps)(SingleValueSelector)
