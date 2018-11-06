import React, {Component} from 'react'
import {connect} from 'react-redux'
import { first } from 'lodash'
// import {Field} from 'redux-form'
import { ensureProjectsLoaded, getProject } from '../../actions/Projects'
import { LIST_KEY__FEATURE_SELECTOR_LIST } from '../../actions/ItemListKeyRegistry'
import {
    update_list_filter,
    getListFilter
} from '../../actions/ItemList'
import Loading from '../Loading'
import FeatureList from '../FeatureList'

class FeatureSelectorForm extends Component {

    componentDidMount() {
        const { dispatch, list_key, project_id, default_filter } = this.props
        this.refresh()
        dispatch(update_list_filter(list_key, Object.assign({},
                                                            default_filter,
                                                            {project_id: project_id})))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, list_key, default_filter } = new_props
        this.refresh()
        if ( new_props.project_id !== this.props.project_id ) {
            dispatch(update_list_filter(list_key, Object.assign({},
                                                                default_filter,
                                                                {project_id: new_props.project_id})))
        }
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

    onFeaturesSelected(feature_ids) {
        const { onChange } = this.props
        const feature_id = first(feature_ids)
        alert("You chose feature " + feature_id)
        onChange(feature_id)
    }
    
    render() {
        const { filter, list_key } = this.props
        if ( ! filter.project_id ) {
            return <Loading/>
        }
        
        return (
            <div>
              <FeatureList list_key={list_key} onSelectFeatures={this.onFeaturesSelected} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { project_id, default_feature_id, onChange } = props
    const project = getProject(state, project_id) || {}
    const list_key = LIST_KEY__FEATURE_SELECTOR_LIST
    const filter = getListFilter(state, list_key)
    
    return {
        enableReinitialize: true,
        project_id,
        project,
        onChange,
        default_feature_id,
        list_key,
        filter
    }
}

export default connect(mapStateToProps)(FeatureSelectorForm)
