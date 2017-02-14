sudo su
service apache2 stop
./letsencrypt-auto certonly --standalone --email gtp@impd.co.za -d mail.impd.co.za -d imptime.impd.co.za
service apache2 start

