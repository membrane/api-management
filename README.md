# api-management
API Management for Membrane Service Proxy

###Installation:

* Install [Membrane Service Proxy](https://github.com/membrane/service-proxy).
* Configure Membrane servive Proxy e.g. by copying $MEMBRANE_HOME/examples/apimanagement/proxies.xml to $MEMBRANE_HOME/conf/proxies.xml
  and adding the following line in your proxies.xml before the router-tag:
```XML
<etcdRegistryApiConfig url="http://localhost:4001"/>
```
* Install [etcd](https://github.com/coreos/etcd) and start it.
* Install [Meteor](https://www.meteor.com/) on your local machine.
* Clone this project.
```bash
git clone https://github.com/membrane/api-management.git
```
* Move terminal to folder and start project.
```bash
cd api-managment/
meteor
```
* Go to [http://localhost:3000/](http://localhost:3000/).
* Register a new user, this will be your first admin.
* Click on login and log in.
* Configure settings.
