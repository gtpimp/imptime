import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import '../sass/search-input.css'
import {browserHistory} from 'react-router'
import {initFilter, runFilter, getFilter, hideResults, showResults} from '../actions/Filter'
import {FILTER_KEY__GLOBAL} from '../actions/ItemListKeyRegistry'
import ReactTimeout from 'react-timeout'

class SearchInput extends Component {

    render() {

        return (
            <div className="search-input">
                <div className="search-input__component"><i className="material-icons">search</i></div>
                <input ref={this.props.termRef} className="search-input__textfield" type="text" placeholder={this.props.placeholder} onChange={this.props.onChange}/>
                { this.props.onOpenDropDown &&
                <div className="search-input__component search-input__show-results-icon" onClick={this.props.onOpenDropDown}>
                    <i className="material-icons">arrow_drop_down</i>
                </div>
                }
            </div>

        )
    }
}

function mapStateToProps(state, props) {
    return {
    }
}

export default connect(mapStateToProps)(ReactTimeout(SearchInput))
