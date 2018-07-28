import React, {Component} from 'react'
import {connect} from 'react-redux'
import ReactTimeout from 'react-timeout'
import styled from 'react-emotion'
import { default_theme as theme } from '../theme/default'

const SearchInputDiv = styled('div')(props => ({color: theme.colours.strong_text,
                                                backgroundColor: theme.colours.page_background,
                                                display: "flex",
                                                borderRadius: "3px",
                                                paddingLeft: "12px",
                                                height: "28px"}))

const SearchInputInput = styled('input')(props => ({backgroundColor: theme.colours.page_background,
                                                    border: "0px",
                                                    width: "278px",
                                                    font: theme.fonts.search_bar,
                                                    ':focus':{outlineWidth: "0"}}))

const SearchInputIconDiv = styled('div')(props => ({height: "28px"}))

const SearchInputIcon = styled('i')(props => ({height: "26px",
                                               width: "28px",
                                               paddingTop: "2px"
}))

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
                  <SearchInputIcon className="material-icons">search</SearchInputIcon>
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
