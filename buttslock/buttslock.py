#!/usr/bin/env python

# Shamelessly pasted from:
# https://serverfault.com/questions/573379/system-suspend-dbus-upower-signals-are-not-seen

from datetime import datetime
import dbus
import gobject
from dbus.mainloop.glib import DBusGMainLoop
import os

def handle_sleep(*args):
    print "%s    PrepareForSleep%s" % (datetime.now().ctime(), args)
    if len(args)>0 and args[0]:
        os.system("/buttslock.sh")

DBusGMainLoop(set_as_default=True)     # integrate into gobject main loop
bus = dbus.SystemBus()                 # connect to system wide dbus
bus.add_signal_receiver(               # define the signal to listen to
    handle_sleep,                      # callback function
    'PrepareForSleep',                 # signal name
    'org.freedesktop.login1.Manager',  # interface
    'org.freedesktop.login1'           # bus name
)

loop = gobject.MainLoop()
loop.run()

