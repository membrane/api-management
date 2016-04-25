# api-management
API Management for Membrane Service Proxy

###Installation:

Run:
```bash
curl https://raw.githubusercontent.com/membrane/api-management/master/install.sh | sh
```
[Membrane Service Proxy](https://github.com/membrane/service-proxy), [etcd](https://github.com/coreos/etcd) and API Management for Membrane Service Proxy are installed in the subfolder ./membrane-api-mgr/ .

###Start
Execute:
```bash
./membrane-api-mgr/bin/start.sh
```
(The first startup might take a while, because the Meteor application needs to download some packages.)
Now go to [http://localhost:3000/](http://localhost:3000/) and login as admin@example.com / admin .


