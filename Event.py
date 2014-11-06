#Event object for the populator

class Event():

  def __init__(self,name=None,schedule=None,location=None,start_date=None,end_date=None):
    self.name = name
    self.schedule = schedule
    self.location = location
    self.start_date = start_date
    self.end_date = end_date

  def randomize():
    
