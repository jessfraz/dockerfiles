# LMCTVPNFY

Let Me Containerize That VPN For You


## How to use this?

Drop your OpenVPN configuration file in this directory.

Let's pretend that it's called `hacktheplanet.ovpn`.

Then all you have to do is to run:

```
docker-compose run vpn hacktheplanet.ovpn
```

If you need a password (because your OpenVPN configuration specifies `auth-user-pass`) you will be prompted for it.

If the VPN server pushes routes and so forth, they will be added to your machine, because the Compose file specifies `net: host` so the container runs within the hosts namespace.

If you **don't** need to specify a password, you can use `docker-compose run -d vpn hacktheplanet.ovpn` to start the container in the background.

If you OpenVPN configuration needs extra files (certificates etc) you can drop them in this directory too.


## Why?

Because we're the containerati and we like when things are [neatly arranged in their boxes](https://twitter.com/zooeypeng/status/613053137050439681).

