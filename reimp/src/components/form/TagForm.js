import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field } from 'redux-form';
import { ensureTagsLoaded, getTag } from '../../actions/Tags'
import { LIST_KEY__FORM_TAG_LIST } from '../../actions/ItemListKeyRegistry'
import TagListTree from '../TagListTree'

class TagForm extends Component {

    constructor(props) {
        super(props)
        this.renderNameInput = this.renderNameInput.bind(this)
        this.renderCategoryInput = this.renderCategoryInput.bind(this)
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

    renderCategoryInput(field) {
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
    
    renderNameInput(field) {
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
        const { handleSubmit, onKeyDown, is_edit, project_id } = this.props

        return (
            <form onSubmit={handleSubmit} className="tagform">
              {  is_edit &&
                 <div className="tag__edit_message">
                   Warning: Editing this tag will affect other issues with this same tag.
                 </div>
              }
              <div>
                <TagListTree project_id={project_id} list_key={LIST_KEY__FORM_TAG_LIST} />
                <div>Category</div>
                <Field component={this.renderCategoryInput} name="category_name"/>
                <br/>
                <br/>
                <div>Name</div>
                <Field component={this.renderNameInput} name="name"/>
                <br/>
                <br/>
                <button className="button" type="submit">Submit</button>
              </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { tag_id, onSubmitted, onKeyDown, initialValues, project_id } = props
    const tag = (tag_id && getTag(state, tag_id)) || {}

    const initial_values = { category_name: tag.category_name,
                             name: tag.name }
    
    return {
        initialValues: initial_values,
        enableReinitialize: true,
        onSubmit: onSubmitted,
        onKeyDown,
        project_id,
        is_edit: tag_id || false
        
    }
}

export default connect(mapStateToProps)(reduxForm({form:'tag_form'})(TagForm))
