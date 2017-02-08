import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../sass/search-box.css'
import {initFilter, runFilter, getFilter} from '../actions/Filter'
import { FILTER_KEY__GLOBAL } from '../actions/ItemListKeyRegistry'
import ReactTimeout from 'react-timeout'

class SearchBox extends Component {

    constructor(props) {
        super(props)
        this.onFilter = this.onFilter.bind(this)
        this.onFilterTermChanged = this.onFilterTermChanged.bind(this)

        this.filter_timeout_id = null
    }

    componentDidMount() {
        const { dispatch, filter_key } = this.props
        dispatch(initFilter(filter_key, 'search/global/'))
    }

    onFilterTermChanged() {
        const {dispatch, filter_key, setTimeout} = this.props
        const value = this.filter_term_el.value
        const that = this
        
        if ( this.filter_timeout_id != null ) {
            clearTimeout(this.filter_timeout_id)
            this.filter_timeout_id = null
        }
        this.filter_timeout_id = setTimeout(function() { that.onFilter(value) }, 500)
    }

    onFilter(value) {
        const {dispatch, filter_key} = this.props
        dispatch(runFilter(filter_key, value))
    }

    render() {

        const { results } = this.props

        return (
            <div className="search-box">
                <div className="search-box__component search-box__icon"><i className="material-icons">search</i></div>
                <input ref={(ref) => this.filter_term_el = ref} className="search-box__textfield" type="text" placeholder="Search Imptime" onChange={this.onFilterTermChanged}/>
                <div className="search-box__component search-box__icon"><i className="material-icons">arrow_drop_down</i></div>

                { results &&
                  results.map(function(result) {
                      <div>
                          <div>{result.category}</div>
                          <div>{result.name}</div>
                          <hr/>
                      </div>
                  })
                }
                
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const filter_key = FILTER_KEY__GLOBAL
    const filter = getFilter(state, filter_key)

    const results = filter.results || null
    const term = filter.term || null

    return {
        filter_key: filter_key,
        results: results,
        term: term
    }
}

export default connect(mapStateToProps)(ReactTimeout(SearchBox))
