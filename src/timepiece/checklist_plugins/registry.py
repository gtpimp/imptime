
from rates_plugin import RatesPlugin

finance_plugin_classes = [ RatesPlugin, ]

def get_finance_plugins(business):
    return [ x(business) for x in finance_plugin_classes ]


