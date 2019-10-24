

services.msc

httpd.exe -k install -n "Apache HTTP Server"
nginx.exe -k install -n "NGINX HTTP Server"

nginx.exe -s start
nginx.exe -s stop

TASKKILL /F /IM "nginx*"

TASKKILL /F /IM "httpd*"

Update-Package -reinstall


RUN > Certmgr.msc