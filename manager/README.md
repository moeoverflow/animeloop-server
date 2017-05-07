# Backend for Animeloop Server

Main class: `Processor` in processor.js

There is delay after each file change event in case of the files are not ready.

Due to an issue in `fs.watch` that there are more than one events emitted each time file changes, a `Set` is used to avoid unnecessary processing.

## TODOs

- Write data to database
- Reomve empty directory (if necessary)

