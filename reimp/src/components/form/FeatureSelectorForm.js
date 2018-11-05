import React, {Component} from 'react'
import {connect} from 'react-redux'
// import {Field} from 'redux-form'
import { ensureProjectsLoaded, getProject } from '../../actions/Projects'

class FeatureSelectorForm extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh()
    }

    refresh() {
        const {dispatch, project_id} = this.props
        dispatch(ensureProjectsLoaded([project_id]))
    }

    onFieldChange(user_id, fieldOnChange) {
        const {onChange} = this.props
        fieldOnChange(user_id)
        if ( onChange ) {
            onChange(user_id)
        }
    }

    /* renderSingleValueSelector(field) {
     *     const {input, data, ...rest} = field
     *     const { project_id, auto_focus } = this.props
     *     return (
     *         <SingleValueSelector
     *             onChange={(user_id) => this.onFieldChange(user_id, input.onChange)}
     *             value={input.value}
     *             options={data}
     *             auto_focus={auto_focus}
     *             rememberer_key={"user_"+project_id}
     *             {...rest}
     *         />
     *     )
     * }*/

    render() {
        return (
            <div>
              Hi there, choose a feature
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { project_id, default_feature_id, onChange } = props
    const project = getProject(state, project_id) || {}
    
    return {
        enableReinitialize: true,
        project_id,
        project,
        onChange,
        default_feature_id
    }
}

export default connect(mapStateToProps)(FeatureSelectorForm)
