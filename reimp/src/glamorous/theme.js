
const fonts_raw = { 'regular-12': "normal normal 400 12px 'Fira Sans', sans-serif",
                    'semibold-12': "normal normal 500 12px 'Fira Sans', sans-serif",
                    'regular-13': "normal normal 400 13px 'Fira Sans', sans-serif",
                    'regular-15': "normal normal 400 15px 'Fira Sans', sans-serif",
                    'bold-15': "normal normal 600 15px 'Fira Sans', sans-serif",
                    'semibold-20': "normal normal 500 20px 'Fira Sans', sans-serif"
}

export const default_theme = {

    colours: { normal_text: '#393E47',
               strong_text: '#001631',
               link: '#005C86',
               list_highlight: '#0B8BB2',
               notok: '#E25A50',
               ok: '#85C087',
               page_background: '#E6EEF0',
               panel_background: '#E9EEF2',
    },

    fonts: { list_items: fonts_raw['regular-12'],
             descriptions: fonts_raw['regular-12'],
             button_popup: fonts_raw['semibold-12'],
             links: fonts_raw['semibold-12'],
             list_headers: fonts_raw['semibold-12'],
             tags: fonts_raw['semibold-12'],
             body: fonts_raw['regular-13'],
             button_menu: fonts_raw['regular-15'],
             breadcrumb_selected: fonts_raw['bold-15'],
             button_large: fonts_raw['semibold-25'],
             sidebar_title: fonts_raw['semibold-25']
    }
    
}
