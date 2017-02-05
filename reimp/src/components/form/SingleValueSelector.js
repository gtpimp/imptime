import React, {Component} from 'react'
import {connect} from 'react-redux'
import {ensureUsersLoaded} from '../../actions/Users'
import '../../sass/single-value-selector.css'

export class SingleValueSelector extends Component {

    constructor(props) {
        super(props)
        this.onSelected = this.onSelected.bind(this)
    }

    onSelected(selected_option) {
        const {onChange} = this.props
        onChange(selected_option.value)
    }

    render() {
        const {options} = this.props

        const suggestions = options.map((option, index) =>
            <div className="single-value-selector__suggestion" key={'suggestion_' + option.value}
                 onClick={() => this.onSelected(option)}>
                <div className="single-value-selector__suggestion-number">
                    {(index + 1)}.
                </div>
                <div className="single-value-selector__suggestion-label">
                    {option.label}
                </div>
            </div>
        )
        return (
            <div className="single-value-selector">
                <div className="single-value-selector__input-wrapper">
                    <input className="single-value-selector__input"/>
                </div>
                <div className="single-value-selector__suggestions">
                    {suggestions}
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
