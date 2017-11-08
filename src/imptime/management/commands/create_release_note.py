import subprocess
import os
from django.utils import timezone
import glob
from django.core.management.base import BaseCommand, CommandError
import logging
logger = logging.getLogger(__name__)

class Command(BaseCommand):

    def handle(self, *args, **kwargs):

        print("Header : ")
        header = raw_input()

        print("Description (multiline, use a blank line to end) :")
        description = "\n".join(iter(raw_input, ''))
        
        migration_folder = os.path.join(os.path.dirname(os.path.realpath(__file__)), "..", "..", "migrations")
        migrations = glob.glob(os.path.join(migration_folder, "0*.py"))
        migrations.sort()
        previous_migration_filename = migrations[-1]
        previous_migration_name = os.path.basename(previous_migration_filename[:-3])

        previous_migration_number = int(previous_migration_name.split("_")[0])
        new_migration_number = previous_migration_number+1
        new_migration_filename = "%s_release_notes_%s_%s.py" % (str(new_migration_number).zfill(4), header[0:20].replace(" ","_"), timezone.now().strftime("%d%b%Y"))

        print("Creating new migration %s, dependant on %s" % (new_migration_filename, previous_migration_filename))

        
        migration_template = """
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="__TOKEN_HEADER__",
                content="__TOKEN_DESCRIPTION__").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '__TOKEN_PREVIOUS_MIGRATION__'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
"""
        migration_content = migration_template.replace("__TOKEN_HEADER__", header)\
                                              .replace("__TOKEN_DESCRIPTION__", description)\
                                              .replace("__TOKEN_PREVIOUS_MIGRATION__", previous_migration_name)

        with open(os.path.join(migration_folder, new_migration_filename), "w") as f:
            f.write(migration_content)

        print("Created migration at %s" % new_migration_filename)
            
    def _cmd(cmd, args, env_variables=None):
        logger.info(cmd)
        cmd_env = os.environ.copy()
        if env_variables:
            cmd_env.update(env_variables)
        subprocess.check_output([cmd]+args, env=cmd_env)
