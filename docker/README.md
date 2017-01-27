# Using Docker

## Start:

`docker-compose up`

# TODO

* support for watching react assets and rebuilding/reloading on changes
* support SSL for localhost dev
* integrate LetsEncrypt for production - use date diff to decide whether to run
* remove git from production containers
* migrations run separately
* coordinate container startup
* lockdown all dependencies (npm, django)
* use read-only containers
** log externally
NB be sure to stop npm being copies to /tmp

## Running

### Run from images

Run using images obtained from the Imptime Docker repository. Use this in production-like environments.

* No access required to source code

### Run from local source code

Run, building images from local source code. Use this for testing.
 
* Images are built from local source code  
* Uses $PROJECT_HOME/external_config
* Provides database 

### Run on top of local source code (Development)

Run on top of local source code. 

* The source code is mounted
* Services are run in development mode

