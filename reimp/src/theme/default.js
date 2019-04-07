import { css } from 'emotion'

const fonts_raw = { 'regular-12': "normal normal 400 12px 'Fira Sans', 'sans-serif'",
                    'semibold-12': "normal normal 500 12px 'Fira Sans', sans-serif",
                    'semibold-15': "normal normal 500 15px 'Fira Sans', sans-serif",
                    'regular-13': "normal normal 400 13px 'Fira Sans', sans-serif",
                    'regular-15': "normal normal 400 15px 'Fira Sans', sans-serif",
                    'regular-16': "normal normal 400 16px 'Fira Sans', sans-serif",
                    'regular-18': "normal normal 400 18px 'Fira Sans', sans-serif",
                    'bold-12': "normal normal 600 12px 'Fira Sans', sans-serif",
                    'bold-15': "normal normal 600 15px 'Fira Sans', sans-serif",
                    'semibold-18': "normal normal 500 18px 'Fira Sans', sans-serif",
                    'semibold-20': "normal normal 500 20px 'Fira Sans', sans-serif",
                    'semibold-26': "normal normal 500 26px 'Fira Sans', sans-serif",
                    'bold-20': "normal normal 600 20px 'Fira Sans', sans-serif",
                    'regular-10': "normal normal 400 10px 'Fira Sans', sans-serif",
}

export const default_theme = {

    colours: { normal_text: '#393E47',
               strong_text: '#001631',
               list_text: '#005C86',
               link: '#005C86',
               subtle_background: 'rgba(0, 92, 134, 0.1)',
               input_background: 'rgba(0, 22, 49, 0.05)',
               list_highlight: 'rgba(0,92,134, 0.07)',
               list_rollover: 'rgba(0,92,134, 0.07)',
               list_selected: 'rgba(11,139,178, 0.10)',
               list_selected_rollover: 'rgba(11,139,178, 0.15)',
               new_item_background: '#E9EEF2',
               notok: '#E25A50',
               ok: '#85C087',
               page_background: '#E6EEF0',
               nav_bar_gradient1: '#0b8bb2',
               nav_bar_gradient2: '#056a86',
               sub_nav_bar: '#E6EEF0',
               panel_background: '#E9EEF2',
               left_panel_background: '#ffffff',
               right_panel_background: '#ffffff',
               single_panel_background: '#ffffff',
               card_background: '#ffffff',
               button_background: '#D8DDE1',
               button_background_hover: '#C7CCD0',
               cell_separator: '#ededed',
               sidebar_button_background: '#E9EEF2',
               button_hover_background: 'rgba(11,139,178,0.10)',
               danger_button_background: '#E25A50',
               danger_button_hover_background: '#e04b40',
               white: '#FFFFFF',
               black: '#000000',
               red: '#E25A50',
               border_strong: '#888888',
               border_faint: '#bbbbbb',
               input_border: '#BDBDBD',

               calendar_issue_history: '#DEAB2C',
               calendar_clock_event: '#7CBBBB'
    },

    fonts: {
        regular_normal: fonts_raw['regular-12'],
        semibold_normal: fonts_raw['semibold-12'],
        bold_normal: fonts_raw['bold-12'],
        bold_huge: fonts_raw['bold-20'],
        regular_large: fonts_raw['regular-15'],
        regular_input: fonts_raw['regular-16'],
        semibold_large: fonts_raw['semibold-15'],
        bold_large: fonts_raw['bold-15'],
        regular_larger: fonts_raw['regular-13'],
        regular_huge: fonts_raw['regular-18'],
        semibold_big: fonts_raw['semibold-18'],
        semibold_huge: fonts_raw['semibold-20'],
        semibold_massive: fonts_raw['semibold-26'],
        
        list_items: fonts_raw['regular-12'],
        descriptions: fonts_raw['regular-12'],
        button_popup: fonts_raw['semibold-12'],
        link: fonts_raw['semibold-12'],
        list_headers: fonts_raw['semibold-12'],
        feature_issue: fonts_raw['bold-12'],
        header: fonts_raw['regular-15'],
        search_bar: fonts_raw['regular-15'],
        tags: fonts_raw['semibold-12'],
        body: fonts_raw['regular-13'],
        button_menu: fonts_raw['regular-15'],
        breadcrumb_selected: fonts_raw['bold-15'],
        button_large: fonts_raw['semibold-25'],
        sidebar_title: fonts_raw['semibold-25'],

        informational: fonts_raw['regular-10']

    },

    font_sizes: {
        dropdown_arrow: "12px",
        superscript: "10px",
        auto_clock_status: "12px"
    },

    spacing: {
        horizontal_space_inline: "5px",
        horizontal_text_space_inside_button: "12px",
        horizontal_row_space_tight: "2px",
        vertical_row_space_tight: "2px",
        mini_button_height: "24px",
        vertical_section_gap: "20px",
        horizontal_section_gap: "20px",
        one: '6px',
        two: '12px',
        three: '18px',
        four: '24px',
        five: '30px',
        six: '36px'
    },

    box_shadows: {
        main: '0 4px 12px 0 rgba(0,0,0,0.3)'
    },

    circles: {
        red: css`width: 21px; height: 21px; border-radius: 50%; background-color: #E25A50`
    },
    breakpoints: {
        mobile: '850px'
    }
}
