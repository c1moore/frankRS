#!/usr/bin/python3 -B

#Script to selectively reset the databases

from os import system
from setup import ask

def main():
  system("mongo --eval \"db.dropDatabase();\" frank-recruiter-system-test > /dev/null")
  print("Database 'test' has been reset.")
  res = ask("Would you like to reset dev as well?: ")
  if res:
    system("mongo --eval \"db.dropDatabase();\" frank-recruiter-system-dev > /dev/null")
    print("Database 'dev' has been reset.")
  else:
    print("Database 'dev' remains unchanged.")

if __name__=='__main__':
  main()
