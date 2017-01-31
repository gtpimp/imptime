import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { Field, reduxForm } from 'redux-form';


class IssueTitleForm extends Component {

    constructor(props) {
        super(props)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleSubmit(values) {
        const { onChange } = this.props
        onChange(values)
    }
    
    render() {

        return (
            <form onSubmit={this.handleSubmit}>
                <div>
                    <label htmlFor="title">Title</label>
                    <Field name="title" component="input" type="text"/>
                </div>
                <button type="submit">Submit</button>
            </form>
        )
        
    }
    
}

function mapStateToProps(state, props) {
    return {
        initialValues: {title:props.initialValue}
    }
}

export default reduxForm({form:'issue_title_form'})(connect(mapStateToProps)(IssueTitleForm))

