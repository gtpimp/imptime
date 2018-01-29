import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm, Field } from 'redux-form';
import Textarea from 'react-expanding-textarea'
import '../../sass/text-component.scss'
import WikiNameField from './WikiNameField';
import PropertyStackComponent from '../PropertyStackComponent'

class NewWikiForm extends Component {

    render() {
        const { handleSubmit, onKeyDown, project_id, initialValues } = this.props

        return (
            <form onSubmit={handleSubmit}>
              <div>
                <div className="wiki_sidebar--textarea">
                  <PropertyStackComponent title="Name">
                    <WikiNameField onKeyDown={onKeyDown} />
                  </PropertyStackComponent>
                </div>
                <button className="button wiki_sidebar--textarea" type="submit">Submit</button>
              </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted, onKeyDown, project_id, sprint_id } = props

    return {
        initialValues: {title:'',
                        sprint_id: sprint_id},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        onKeyDown,
        project_id
    }
}

export default connect(mapStateToProps)(reduxForm({form:'new_wiki_form'})(NewWikiForm))
