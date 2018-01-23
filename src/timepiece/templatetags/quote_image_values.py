from django import template


register = template.Library()

@register.simple_tag
def top_value(annotation, an_size, height):
    return annotation.y_pos - (an_size * annotation.y_offset_to_target / height)

@register.simple_tag
def left_value(annotation, an_size, width):
    return annotation.x_pos - (an_size * annotation.x_offset_to_target / width)
