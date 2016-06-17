from django.core.paginator import Paginator
from django.conf import settings


def apply_filter(qs, raw_filter_args):

    filter_args = {}

    for k, v in raw_filter_args.items():
        if k == 'ids':
            filter_args['pk__in'] = [int(x) for x in v]

        else:
            raise Exception("Unknown filter argument: %s" % k)

    qs = qs.filter(**filter_args)
    return qs


def apply_pagination(qs, pagination):

    if not pagination.get('enabled', True):
        return qs

    page_size = pagination.get(
        'page_size', settings.PAGINATION_DEFAULT_PAGINATION)
    current_page = pagination.get('page', 1)

    p = Paginator(qs, page_size)
    page = p.page(current_page)

    pagination['num_pages'] = p.num_pages
    pagination['num_items'] = p.count
    pagination['has_next_page'] = page.has_next()
    pagination['has_prev_page'] = page.has_previous()
    pagination['first_item_index'] = page.start_index()
    pagination['last_item_index'] = page.end_index()

    return page.object_list
