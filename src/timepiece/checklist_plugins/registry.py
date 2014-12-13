
from rates_plugin import RatesPlugin

finance_plugin_classes = [ RatesPlugin, ]
def get_finance_plugins(business):
    return [ x(business) for x in finance_plugin_classes ]

dev_plugin_classes = [  ]
def get_dev_plugins(business):
    return [ x(business) for x in dev_plugin_classes ]

traffic_plugin_classes = [  ]
def get_traffic_plugins(business):
    return [ x(business) for x in traffic_plugin_classes ]
