#Event object

from Util import randomString
from Util import randomTimeInMS
from Util import DATABASE

class Event:

  def __init__(self):
    pass

  def randomize(self):
    self.name = randomString(3,20)
    self.schedule = 'www.' + randomString(6,12) + random.choice(['.com','.org','.nz','.biz'])
    self.location = randomString(2,10)
    self.start_date = randomTimeInMS()
    self.end_date = randomTimeInMS(self.start_date)

  def valid(self):
    return (hasattr(self,name) and hasattr(self,schedule) and hasattr(self,location) and
		hasattr(self,start_date) and hasattr(self,end_date))

  
