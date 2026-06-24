#!/usr/bin/env bash
# Terminate any running Firefox instances
pkill firefox
sleep 3

# 3. Force execution of your exact autostart file by its full path
DISPLAY=:0 DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/1000/bus" /usr/bin/dex /home/user/.config/autostart/firefox.desktop