
from timepiece.models import *
Rate.objects.all().update(amount=5)
Rate.objects.all().update(billable_amount=6)
Invoice.objects.all().update(amount=20)
Income.objects.all().update(amount=3)
Expense.objects.all().update(amount=3)
Salary.objects.all().update(amount=3)
UserProfile.objects.all().update(amount=4)
