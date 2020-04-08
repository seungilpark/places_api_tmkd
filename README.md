# Google Places API Integration with TMKD

## approach 1 : automating event creation in TMKD db
- automate creating events / places for TMKD with google places
- e.g. hiking trails, parks, 
- fetch all those events / places and store in TMKD db in events table


### pros
- easiest to implement

### cons
- if manually input, updating / managing of the rows will be difficult
- if 1000s of parks open time etc. is changed, how will one update those on to the db? 

## approach 2 : fetching and displaying

### pros
- easier to manage once implemented because manging side can be done by google 

### cons
- in each page, it uses request to the api
- increased processing due to more frequent transfer from  google api object to tmkd dto to the client side 
