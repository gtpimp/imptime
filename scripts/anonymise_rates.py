
from timepiece.models import *
from invoicing.models import InvoiceItem, InvoicePayment, Invoice
Rate.objects.all().update(amount=5)
Rate.objects.all().update(billable_amount=6)
Invoice.objects.all().update(amount=20)
Income.objects.all().update(amount=3)
Expense.objects.all().update(amount=3)
Salary.objects.all().update(amount=3, paye=4,bonus=5,expenses=6,uif=7)
UserProfile.objects.all().update(amount=4, billable_amount=4)
InvoiceItem.objects.all().update(total_cost=3, unit_cost=1)
InvoicePayment.objects.all().update(amount=1)
