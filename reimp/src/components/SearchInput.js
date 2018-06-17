import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../sass/search-input.css'
import ReactTimeout from 'react-timeout'
import glamorous from 'glamorous'
import { default_theme as theme } from '../glamorous/theme'

const SearchInputDiv = glamorous.div({color: theme.colours.strong_text,
                                      backgroundColor: theme.colours.page_background,
                                      display: "flex",
                                      borderRadius: "3px",
                                      paddingLeft: "12px"})

const SearchInputInput = glamorous.input({backgroundColor: theme.colours.page_background,
                                          border: "0px",
                                          width: "278px",
                                          ':focus':{outlineWidth: "0"}})

class SearchInput extends Component {

    render() {

        return (
            <SearchInputDiv>
              <SearchInputInput ref={this.props.termRef}
                                type="text"
                                placeholder={this.props.placeholder}
                                onChange={this.props.onChange}/>
              { this.props.onOpenDropDown &&
                <div className="search-input__component" onClick={this.props.onOpenDropDown}>
                  <glamorous.I className="material-icons" height="28px">search</glamorous.I>
                </div>
              }
            </SearchInputDiv>
        )
    }
}

function mapStateToProps(state, props) {
    return {
    }
}

export default connect(mapStateToProps)(ReactTimeout(SearchInput))
