
const fonts_raw = { 'regular-12': "normal normal 400 12px 'Fira Sans', sans-serif",
                    'semibold-12': "normal normal 500 12px 'Fira Sans', sans-serif",
                    'semibold-15': "normal normal 500 15px 'Fira Sans', sans-serif",
                    'regular-13': "normal normal 400 13px 'Fira Sans', sans-serif",
                    'regular-15': "normal normal 400 15px 'Fira Sans', sans-serif",
                    'bold-12': "normal normal 600 12px 'Fira Sans', sans-serif",
                    'bold-15': "normal normal 600 15px 'Fira Sans', sans-serif",
                    'semibold-20': "normal normal 500 20px 'Fira Sans', sans-serif"
}

export const default_theme = {

    colours: { normal_text: '#393E47',
               strong_text: '#001631',
               list_text: '#005C86',
               link: '#005C86',
               list_highlight: '#0B8BB2',
               list_rollover: 'rgba(0,92,134, 0.07)',
               list_selected: 'rgba(11, 139, 178, 0.15)',
               list_selected_rollover: 'rgba(11, 139, 178, 0.3)',
               notok: '#E25A50',
               ok: '#85C087',
               page_background: '#E6EEF0',
               sub_nav_bar: '#E6EEF0',
               panel_background: '#E9EEF2',
               left_panel_background: '#fafbfc',
               right_panel_background: '#ffffff',
               button_background: '#D8DDE1',
               button_background_hover: '#C7CCD0'
    },

    fonts: {
        regular_normal: fonts_raw['regular-12'],
        semibold_normal: fonts_raw['semibold-12'],
        bold_normal: fonts_raw['bold-12'],
        regular_large: fonts_raw['regular-15'],
        semibold_large: fonts_raw['semibold-15'],
        bold_large: fonts_raw['bold-15'],
        regular_larger: fonts_raw['regular-13'],
        semibold_huge: fonts_raw['semibold-20'],
        
        list_items: fonts_raw['regular-12'],
        descriptions: fonts_raw['regular-12'],
        button_popup: fonts_raw['semibold-12'],
        links: fonts_raw['semibold-12'],
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

    },

    font_sizes: {
        dropdown_arrow: "12px"
    }
    
}
