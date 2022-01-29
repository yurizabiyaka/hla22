# labone backend

## Implemented features:

- [x] register
- [x] sign-in by credentials (user enters email/password)
- [x] transparent login (if an 'auth' token cookie exists, SPA  performs a sign-in by the token)
- [x] add posts to the personal page
- [x] list other user's profiles
- [x] make friend requests
- [x] list yours friend requests

## TODO

- [ ] range select via SELECT ... LIMIT a, b
- [ ] list incoming friend requests with status
- [ ] acquire a friend request
- [ ] decline a friend request
- [ ] user subscription status (if someone has a friendrequest to you)
- [ ] friendfeed on yours friends (those that have ACKed yuour request) (with likes count, i like status and comments) 
- [ ] setting likes
- [ ] making comments
- [ ] feature-list section in abouts

# Description
## backend

The backend uses config file ***config.env*** in the home directory with key=value pairs:

|variable name | description |
| ----------- | ----------- |
|DB_HOSTANDPORT | database e.g. *localhost:3306* |
|DB_USER | *dbuser* |
|DB_PASSWORD | *dbpass* |
|DB_NAME | *labonedb* |
|CORS_ORIGIN | requests from that origin will be allowed by a browser. E.g. if our frontend is running on https host lab-one.ru and port is 80, the setting should be *https://lab-one.ru:80*. This does not corresponds to backend port, but the backend should refer this origin in Access-Control-Allow-Origin header for the browser making the request |
|LISTEN_HOSTANDPORT | this is where backend listens to requests |

You can override them in system environment.

