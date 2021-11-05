  DROP TABLE IF EXISTS mysignatures;

   CREATE TABLE mysignatures (
       id SERIAL PRIMARY KEY,
       first VARCHAR NOT NULL CHECK (first != ''),
       last VARCHAR NOT NULL CHECK (last != ''),
       signature TEXT NOT NULL CHECK (signature != '')
   );
