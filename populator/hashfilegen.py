#!/usr/bin/python3 -B

#Script that was used to create hashfile.dat, containing a salt and password
#You must first create a single valid user in the database for me to locate
#Assumes that the plaintext password was "password" in User.py

from Util import getPymongoDB

import pickle

def main():
  db = getPymongoDB()
  user = list(db.users.find())[0]
  salt = user['salt']
  password = user['password'] #Hashed
  with open('hashfile.dat','w') as fd:
    fd.write(salt)
    fd.write(password)

if __name__=='__main__':
  print("Cowardly refusing to run because I'm not confident that you know what you're doing.")


