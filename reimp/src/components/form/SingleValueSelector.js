import React, {Component} from 'react'
import {connect} from 'react-redux'
import {ensureUsersLoaded} from '../../actions/Users'
import '../../sass/single-value-selector.css'

export class SingleValueSelector extends Component {

    constructor(props) {
        super(props)
        this.onSelected = this.onSelected.bind(this)
        this.onSelectionFilterChanged = this.onSelectionFilterChanged.bind(this)
    }

    onSelected(selected_option) {
        const {onChange} = this.props
        onChange(selected_option.value)
    }

    onSelectionFilterChanged() {
        this.setState({filter:this.selection_filter_el.value})
    }

    render_suggestions() {
        const {options} = this.props
        const filter = (this.state || {}).filter || undefined
        const that = this

        const suggestions = options.map( function(option, index) {
            const filterable_label = (index + 1) + ". " + option.label
            if ( filter === undefined || filter.length == 0 || filterable_label.indexOf(filter) > -1) {
                return (
                    <div className="single-value-selector__suggestion" key={'suggestion_' + option.value}
                         onClick={() => that.onSelected(option)}>
                        <div className="single-value-selector__suggestion-number">
                            {(index + 1)}.
                        </div>
                        <div className="single-value-selector__suggestion-label">
                            {option.label}
                        </div>
                    </div>
                )
            } else {
                return null
            }
        })
        return suggestions
    }

    render() {
        
        return (
            <div className="single-value-selector">
                <div className="single-value-selector__input-wrapper">
                    <input className="single-value-selector__input" ref={(ref)=> this.selection_filter_el=ref}  onChange={this.onSelectionFilterChanged}/>
                </div>
                <div className="single-value-selector__suggestions">
                    {this.render_suggestions()}
                </div>
                {/*<Field name="assigned_to" component={this.renderSelectList}*/}
                       {/*valueField="value"*/}
                       {/*textField="label"*/}
                       {/*data={assignable_users}*/}
                {/*/>*/}
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
