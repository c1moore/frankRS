#!/usr/bin/python3 -B

#A script to install all dependencies for testing an deployment that are
#  specific to our use of the MEAN stack. This script does not include
#  setup of npm, node.js, mongo etc: only the dependencies required
#  after having completed that initial setup

#The intention is to provide developers with an easy transition to a new
#  system 

from os import system

def ask(msg):
  response = input(msg)
  if (response=="yes" or response=="Yes" or response=="YES"):
    print("User Accepted")
    return True
  else:
    print("User rejected the operations")
    return False

def welcome():
  print("I assume you have already installed npm, nodejs, mongo, and bower.")
  print("I will now perform more advanced configuration at your request.")

def main():
  welcome()
  res = ask("Would you like to update your system packages first?: ")
  if res:
    system("sudo aptitude update; sudo aptitude full-upgrade")
  res = ask("Would you like to run 'npm install'?: ")
  if res:
    system("sudo npm install")
  res = ask("Would you like to install the populator's dependencies?: ")
  if res:
    system("sudo aptitude install python3-pip build-essential python3-dev")
    system("sudo pip3 install pymongo")
  res = ask("Would you like to install required bower packages?: ")
  if res:
      system("bower install ng-table lodash jquery-ui font-awesome angularjs-dropdown-multiselect textAngular ng-flow#~2")
  res = ask("Would you like to install protractor?: ")
  if res:
    system("sudo npm install -g protractor")
  print("Done!")

if __name__=='__main__':
  main()
