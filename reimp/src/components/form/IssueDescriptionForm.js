import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm } from 'redux-form';
import Textarea from 'react-expanding-textarea'

class IssueDescriptionForm extends Component {

    render() {

        const { initialValues, handleSubmit } = this.props
        
        return (
            <form onSubmit={handleSubmit}>
                <div>
                    {/*<label htmlFor="description">Description</label>*/}
                    {/*<Field name="description" component="textarea" type="text"/>*/}
                    <Textarea
                        rows="1"
                        maxLength="3000"
                        className="textarea textarea--text-component"
                        placeholder="Description"
                        onChange={ this.handleChange }
                        value={initialValues.description} />
                {/*</div>*/}
                </div>
                <button type="submit">Submit</button>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onChange } = props
    
    return {
        initialValues: {description:props.initial_value},
        enableReinitialize: true,
        onSubmit: onChange
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_description_form'})(IssueDescriptionForm))

