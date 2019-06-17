import { css } from 'emotion'
import { default_theme as theme } from '../../theme/default'

export const mobile_styles = {
    main : css`
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 100vh;
    background-color: ${theme.colours.page_background};
    align-items: center;
    `,

    box : css`
    width: 560px;
    background-color: ${theme.colours.white};
    margin-top: 50px;
    box-shadow: ${theme.box_shadows.main};

    @media (max-width: ${theme.breakpoints.mobile}) {
        width: 100%;
        height: 100%;
        box-shadow: none;
        border-radius: 0;
        border: none;
        position: absolute;
        left: 0;
        top: 0;
        margin-top: 0;
    }
    `,

    summary_header : css`
    padding: 24px;
    `,

    card_title : css`
    font: ${theme.fonts.semibold_massive};
    `,

    circle : css`
    width: 21px; 
    height: 21px; 
    border-radius: 50%;
    margin-right: 5px;
    background-color: ${theme.colours.red}
    `,

    title_row : css`
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: flex-start;
    `,

    status_row : css`
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: flex-start;
    `,

    status_text : css`
    font: ${theme.fonts.regular_huge};
    `,

    red_text : css`
    color: ${theme.colours.red}
    `,

    spacer : css`
    color: ${theme.colours.button_background};
    padding: 0 10px 0 10px;
    font-size: 18px;
    `,

    image_section : css`
    display: flex;
    flex: 1;
    `,

    placeholder_image : css`
    width: 100%;
    height: 300px;
    `,

    summary_content : css`
    display: flex;
    flex: 1;
    flex-direction: column;
    `,

    content_title : css`
    font: ${theme.fonts.semibold_big};
    `,

    context_description : css`
    display: flex;
    flex-direction: column;
    padding: 24px;
    `,

    content_row : css`
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 24px;
    border-bottom: 1px solid #E6E6E6;
    font: ${theme.fonts.regular_huge};
    `,

    sub_content_row : css`
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 24px;
    font: ${theme.fonts.regular_huge};
    `,

    deadline_row : css`
    display: flex;
    flex: 1;
    justify-content: space-between;
    align-items: space-between;
    padding: 24px;
    border-bottom: 1px solid #E6E6E6;
    font: ${theme.fonts.regular_huge};
    `,

    left_content : css`
    display: flex;
    flex: 5;
    justify-content: space-between;
    align-items: space-between;
    `,

    bar_container : css`
    display: flex;
    width: 100%;
    height: 15px;
    margin-top: 10px;
    `,

    description_text : css`
    margin-top: 10px;
    `,

    section : css`
    padding-top: ${theme.spacing.two};
    padding-bottom: ${theme.spacing.two};
    border-bottom: 1px solid ${theme.colours.border_strong};
    `,

    mini_section : css`
    padding-top: ${theme.spacing.two};
    padding-bottom: ${theme.spacing.two};
    border-bottom: 1px solid ${theme.colours.border_faint};
    `,

}