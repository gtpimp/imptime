#!/usr/bin/env bash

HOST=unstable.fives-alive.com
ssh -i /home/ec2-user/.ssh/id_rsa "ec2-user@$HOST" 'cd /opt/imptime && ./docker-compose -f docker-compose.yml down'
ssh -i /home/ec2-user/.ssh/id_rsa "ec2-user@$HOST" 'if mount | grep /imptime-media; then echo umount /imptime-media; else echo "/imptime-media not mounted"; fi'
