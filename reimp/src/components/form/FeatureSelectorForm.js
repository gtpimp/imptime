import React, {Component} from 'react'
import {connect} from 'react-redux'
import { first } from 'lodash'
import { css } from 'emotion'
// import {Field} from 'redux-form'
import { ensureProjectsLoaded, getProject } from '../../actions/Projects'
import { LIST_KEY__FEATURE_SELECTOR_LIST } from '../../actions/ItemListKeyRegistry'
import {
    update_list_filter,
    getListFilter
} from '../../actions/ItemList'
import Loading from '../Loading'
import FeatureList from '../FeatureList'
import PopupPanelButton from '../PopupPanelButton'

class FeatureSelectorForm extends Component {

    constructor(props) {
        super(props)
        this.state = { selected_feature_node: null }
    }
    
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

    onFeaturesSelected = (feature_nodes) => {
        const feature_node = first(feature_nodes)
        this.setState({selected_feature_node:feature_node})
    }

    onSubmit = () => {
        const { selected_feature_node } = this.state
        const { onSubmitted } = this.props
        onSubmitted({feature_id:selected_feature_node.id})
    }
    
    render() {
        const { filter, list_key } = this.props
        const { selected_feature_node } = this.state
        if ( ! filter.project_id ) {
            return <Loading/>
        }
        
        return (
            <div className={css`height:100%`}>
              <FeatureList list_key={list_key} onSelectFeatures={this.onFeaturesSelected} />
              { selected_feature_node && 
                <PopupPanelButton onClick={this.onSubmit}>Select {selected_feature_node.name}</PopupPanelButton>
              }
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
