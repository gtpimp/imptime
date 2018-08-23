import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { css } from 'emotion'
import { map, pull, filter, includes, keys, keyBy, find } from 'lodash'
import { optionSelected, getBestOptions } from '../../actions/OptionRemember'
import '../../sass/single-value-selector.css'
import { default_theme as theme } from '../../theme/default'
import PopupPanelMiniButton from '../PopupPanelMiniButton'

export class MultiValueSelector extends Component {

    constructor(props) {
        super(props)
        this.onSelected = this.onSelected.bind(this)
        this.onSelectionFilterChanged = this.onSelectionFilterChanged.bind(this)
        this.onKeyDownOnSelectionFilter = this.onKeyDownOnSelectionFilter.bind(this)
        this.onSelectionFinalised = this.onSelectionFinalised.bind(this)
        this.state = { selections: [] }
    }

    componentDidMount() {
        const { auto_focus, value } = this.props
        if ( auto_focus ) {
            this.selection_filter_el && this.selection_filter_el.focus()
        }
        if ( value ) {
            this.setState({selections: value})
        }
    }
    
    onSelected(selected_option) {
        const {dispatch, rememberer_key} = this.props
        dispatch(optionSelected(rememberer_key, selected_option.value))
        this.onToggleSelection(selected_option.value)
    }

    onToggleSelection(value) {
        const { selections } = this.state
        if ( includes(selections, value) ) {
            pull(selections, value)
        } else {
            selections.push(value)
        }
        this.setState({selections: selections})
    }

    onSelectionFinalised() {
        const { onChange } = this.props
        const { selections } = this.state
        onChange(selections)
    }

    onSelectionFilterChanged(evt) {
        const { onFilterChanged } = this.props
        const new_filter_value = this.selection_filter_el.value
        evt.stopPropagation()
        evt.preventDefault()
        this.setState({filter_term:new_filter_value})
        if ( onFilterChanged ) {
            onFilterChanged(new_filter_value)
        }
    }

    onKeyDownOnSelectionFilter(event) {
        if (event.keyCode === 13) {
            const options = this.getFilteredOptions()
            if ( options.length === 1 ) {
                this.onToggleSelection(options[0].value)
            } else {
                this.onToggleSelection(this.selection_filter_el.value)
            }
            event.stopPropagation()
            event.preventDefault()
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

    render_selections() {
        const { options } = this.props
        const { selections } = this.state

        const selected_options = filter(options, (option) => includes(selections, option.value))
        
        return (
            <div className={css`display:flex`}>
              { map(selected_options, function(selected_option, index) {
                    return (
                        <div key={index}
                             className={css`padding-right: ${theme.spacing.horizontal_space_inline}`}>
                          {selected_option.label}
                        </div>
                    )
                }
                )}
            </div>
        )
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
        const {options} = this.props
        const { selections } = this.state
        const that = this

        const filtered_options = this.getFilteredOptions(options)
        const suggestions = map(filtered_options, function(option, index) {
            return (
                <div className={classNames("single-value-selector__suggestion",
                                           {"single-value-selector__suggestion--selected":includes(selections, option.value)})}
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
        
        return (
            <div className="single-value-selector">
                <div className="single-value-selector__input-wrapper">
                  <input onKeyDown={this.onKeyDownOnSelectionFilter}
                         placeholder={placeholder}
                         className="single-value-selector__input"
                         ref={(ref)=> this.selection_filter_el=ref}
                         onChange={this.onSelectionFilterChanged}/>
                </div>
                <div className="single-value-selector__active-suggestions">
                  {this.render_selections()}
                </div>
                { false && 
                  <div className="single-value-selector__best-suggestions">
                    {this.render_best_suggestions()}
                  </div>
                }
                <div className="single-value-selector__suggestions">
                  {this.render_suggestions()}
                </div>
                <PopupPanelMiniButton onClick={this.onSelectionFinalised}>Done</PopupPanelMiniButton>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { options, value, auto_focus, placeholder, rememberer_key, onFilterChanged } = props

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

export default connect(mapStateToProps)(MultiValueSelector)
