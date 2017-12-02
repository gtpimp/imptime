import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field } from 'redux-form';
import { ensureTagsLoaded, getTag } from '../../actions/Tags'

class TagForm extends Component {

    constructor(props) {
        super(props)
        this.renderNameSelector = this.renderNameSelector.bind(this)
        this.renderCategorySelector = this.renderCategorySelector.bind(this)
    }
    
    componentDidMount() {
        this.refresh()
        this.category_input_el && this.category_input_el.focus()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, tag_id } = props
        if ( tag_id ) {
            dispatch(ensureTagsLoaded([tag_id]))
        }
    }

    renderCategorySelector(field) {
        const { onKeyDown } = this.props
        const {input, data, onChange, ...rest} = field
        return (
            <input
                rows="1"
                maxLength="20"
                className="tagform--category"
                placeholder="Category"
                onChange={input.onChange}
                value={input.value}
                ref={(ref)=> this.category_input_el=ref}
                onKeyDown={onKeyDown}
            />
        )
    }
    
    renderNameSelector(field) {
        const { onKeyDown } = this.props
        const {input, data, onChange, ...rest} = field
        return (
            <input
                rows="1"
                maxLength="20"
                className="tagform--name"
                placeholder="Name"
                onChange={input.onChange}
                value={input.value}
                ref={(ref)=> this.name_input_el=ref}
                onKeyDown={onKeyDown} 
            />
        )
    }
    
    render() {
        const { handleSubmit, onKeyDown, is_edit } = this.props

        return (
            <form onSubmit={handleSubmit} className="tagform">
              {  is_edit &&
                 <div className="tag__edit_message">
                   Warning: Editing this tag will affect other issues with this same tag.
                 </div>
              }
              <div>
                <div>Category</div>
                <Field component={this.renderCategorySelector} name="category_name"/>
                <br/>
                <br/>
                <div>Name</div>
                <Field component={this.renderNameSelector} name="name"/>
                <br/>
                <br/>
                <button className="button" type="submit">Submit</button>
              </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { tag_id, onSubmitted, onKeyDown, initialValues } = props
    const tag = (tag_id && getTag(state, tag_id)) || {}

    const initial_values = { category_name: tag.category_name,
                             name: tag.name }
    
    return {
        initialValues: initial_values,
        enableReinitialize: true,
        onSubmit: onSubmitted,
        onKeyDown,
        is_edit: tag_id || false
        
    }
}

export default connect(mapStateToProps)(reduxForm({form:'tag_form'})(TagForm))
