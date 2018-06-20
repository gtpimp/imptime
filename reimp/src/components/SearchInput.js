import React, {Component} from 'react'
import {connect} from 'react-redux'
// import '../sass/search-input.css'
import ReactTimeout from 'react-timeout'
import glamorous from 'glamorous'
import { default_theme as theme } from '../glamorous/theme'

const SearchInputDiv = glamorous.div({color: theme.colours.strong_text,
                                      backgroundColor: theme.colours.page_background,
                                      display: "flex",
                                      borderRadius: "3px",
                                      paddingLeft: "12px",
                                      height: "28px",
                                      width: "306px"})

const SearchInputInput = glamorous.input({backgroundColor: theme.colours.page_background,
                                          border: "0px",
                                          width: "278px",
                                          font: theme.fonts.search_bar,
                                          ':focus':{outlineWidth: "0"}})

const SearchInputIconDiv = glamorous.div({height: "28px"})

const SearchInputIcon = glamorous.i({height: "26px",
                                     width: "28px",
                                     paddingTop: "2px"
})

class SearchInput extends Component {

    render() {

        return (
            <SearchInputDiv>
              <SearchInputInput ref={this.props.termRef}
                                type="text"
                                placeholder={this.props.placeholder}
                                onChange={this.props.onChange}/>
              { this.props.onOpenDropDown &&
                <SearchInputIconDiv onClick={this.props.onOpenDropDown}>
                  <SearchInputIcon className="material-icons" height="28px">search</SearchInputIcon>
                </SearchInputIconDiv>
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
