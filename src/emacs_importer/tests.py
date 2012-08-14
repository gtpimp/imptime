import unittest
import os
from process_for_timepiece import Processor

class Test(unittest.TestCase):
    
    def test_extract_clocktables(self):
        f = os.path.join(os.path.dirname(os.path.realpath(__file__)), "test_files", "test_extract_clocktables_from_lines.org")
        p = Processor()
        clocktable_entries = p.extract_clocktable_entries(f)
        p.import_clocktable_entries("test", clocktable_entries)
