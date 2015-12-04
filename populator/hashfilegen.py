#!/usr/bin/python3 -B

#Script that was used to create hashfile.dat, containing a salt and password
#You must first create a single valid user in the database for me to locate
#Assumes that the plaintext password was "password" in User.py

from Util import getPymongoDB

import pickle
import base64

def main():
	db = getPymongoDB()
	user = list(db.users.find())[0]
	with open('hashfile.dat','wb') as fd:
		pickle.dump(user['salt'], fd)
		pickle.dump(user['password'], fd)

# If this program should need to run again, simply comment out the print statement and uncomment main()
if __name__=='__main__':
# 	main()
	print("Cowardly refusing to run because I'm not confident that you know what you're doing.")


