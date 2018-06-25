import glamorous from 'glamorous'
import { default_theme as theme } from '../glamorous/theme'

const DefaultListRowStyle = {display: 'flex',
                             flexDirection: 'row',
                             minHeight: '40px',
                             font: theme.fonts.list_items,              
                             paddingLeft: '18px',
                             backgroundColor: theme.colours.left_panel_background,
                             
                             ':hover': {
                                 backgroundColor: theme.colours.list_rollover
                             }
}

const TableCellStyle = {display: 'flex',
                        font: theme.fonts.list_items,
                        paddingLeft: '6px',
                        verticalAlign: 'middle',
                        alignItems: 'center',
                        flex: '0 0 190px',
                        color: theme.colours.list_text
}

export const ProjectRowDiv = glamorous.div(DefaultListRowStyle,
                                           ({is_selected}) => (
                                               {backgroundColor: is_selected ? theme.colours.list_selected : theme.colours.left_panel_background,
                                                ':hover': {
                                                    backgroundColor: is_selected ? theme.colours.list_selected_rollover : theme.colours.list_rollover
                                                }}
                                           )
)

export const TableCellDiv = glamorous.div(TableCellStyle)
export const TableCellSecondaryDiv = glamorous.div(TableCellStyle,
                                                   {color: theme.colours.normal_text})
