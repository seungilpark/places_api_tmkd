# Google Places API for TMKD

## setup
1. npm install
2. make config.json 
e.g. 
```json
{
    "key":"asdjkflasjdflkasjdf"
}
```
key is Google Places API key

3. assign  RADIUS: int, TYPES: string[], CITIES:{}, OUTPUT_DIR: path to output JSONs

## output
e.g.
./result/Vancouver/Park.json
./result/Vancouver/Library.json
./result/Nelson/Park.json
./result/Nelson/Library.json

with each item in the JSON array being an Event Detail


## todos
- place_id refresh request. Google Places API periodically update place_ids so the query to get the details might get Not_found 
 
- SQL script for inserting / updating events

- photo request