import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field } from 'redux-form';
import { ensureTagsLoaded, getTag } from '../../actions/Tags'

class TagForm extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, tag_id } = props
        dispatch(ensureTagsLoaded([tag_id]))
    }
    
    render() {
        const { handleSubmit, onKeyDown } = this.props

        return (
            <form onSubmit={handleSubmit}>
              <div>
                It's a form
                <button className="button issue_sidebar--textarea" type="submit">Submit</button>
              </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { tag_id, onSubmitted, onKeyDown, initialValues } = props
    const tag = getTag(tag_id) || {}
    
    return {
        initialValues: { category_name: tag.category_name,
                         name: tag.name },
        enableReinitialize: true,
        onSubmit: onSubmitted,
        onKeyDown
        
    }
}

export default connect(mapStateToProps)(reduxForm({form:'tag_form'})(TagForm))
