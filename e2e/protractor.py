#!/usr/bin/python3

import os, time
from subprocess import Popen

grunt = Popen(['grunt'])
time.sleep(15)
protractor = Popen(['protractor','conf.js'])
protractor.wait()
grunt.terminate()


