#!/bin/sh
[[ $TRACE ]] && set -x # For debugging
[[ $EXIT ]] && set -e # For debugging
main(){
	UNAME=$(uname)
	echo "=====================================================================
This script installs API-Management, etcd and Membrane Service Proxy.
====================================================================="
	if [ ! -d "membrane-api-mgr" ]; then
		mkdir membrane-api-mgr
	fi
	cd membrane-api-mgr
	if [ ! -d "conf" ]; then
		mkdir conf
	fi
	if [ ! -d "bin" ]; then
		mkdir bin
	fi
	if [ ! -d "tmp" ]; then
		mkdir tmp
	fi
	command -v git >/dev/null 2>&1 || { echo >&2 "git is required but it's not installed.  Aborting."; exit 1; }
	command -v curl >/dev/null 2>&1 || { echo >&2 "curl is required but it's not installed.  Aborting."; exit 1; }
	command -v unzip >/dev/null 2>&1 || { echo >&2 "unzip is required but it's not installed.  Aborting."; exit 1; }
	command -v tar >/dev/null 2>&1 || { echo >&2 "tar is required but it's not installed.  Aborting."; exit 1; }
	curl -L https://github.com/membrane/service-proxy/releases/download/v4.2.1/membrane-service-proxy-4.2.1.zip -o membrane-service-proxy-4.2.1.zip
	unzip -q membrane-service-proxy-4.2.1.zip
	rm membrane-service-proxy-4.2.1.zip
	
	command -v meteor >/dev/null 2>&1 || { curl https://install.meteor.com/ | sh; }
	if [ "$UNAME" != "Linux" -a  "$UNAME" != "Darwin" ] ; then
		exit 1
	fi	
	if [ "$UNAME" = "Linux" ] ; then
		curl -L  https://github.com/coreos/etcd/releases/download/v2.3.1/etcd-v2.3.1-linux-amd64.tar.gz -o etcd-v2.3.1-linux-amd64.tar.gz
		tar xzvf etcd-v2.3.1-linux-amd64.tar.gz
		cp ./etcd-v2.3.1-linux-amd64/etcd ./bin/etcd
		rm etcd-v2.3.1-linux-amd64.tar.gz
		rm -r ./etcd-v2.3.1-linux-amd64	
	fi
	if [ "$UNAME" = "Darwin" ] ; then
		curl -L  https://github.com/coreos/etcd/releases/download/v2.3.3/etcd-v2.3.3-darwin-amd64.zip -o etcd-v2.3.3-darwin-amd64.zip
		unzip etcd-v2.3.3-darwin-amd64.zip
		cp ./etcd-v2.3.3-darwin-amd64/etcd ./bin/etcd
		rm etcd-v2.3.3-darwin-amd64.zip
		rm -r ./etcd-v2.3.3-darwin-amd64	
	fi
	command -v git >/dev/null 2>&1 || { echo >&2 "git is required but it's not installed.  Aborting."; exit 1; }
	git clone https://github.com/membrane/api-management.git

	cp ./api-management/conf/proxies.xml ./conf/proxies.xml

	echo '#/bin/sh
[[ $TRACE ]] && set -x # For debugging
[[ $EXIT ]] && set -e # For debugging
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
help() {
   printf "\
start	 			start etcd, membrane service proxy and api-managment
stop	 			stop etcd, membrane service proxy and api-managment
startetcd			start etcd
stopetcd			stop etcd
startserviceproxy		start membrane service proxy
stopserviceproxy		stop membrane service proxy
startapimanagement		start api-mangement
stopapimanagement		stop api-mangement
"
}
startetcd(){
	if [ -e $DIR/../tmp/etcd.tmp ]
		then
			echo "================================
etcd already started
================================"
		else
				$DIR/etcd 2> $DIR/../tmp/etcd.log & echo "$!" > $DIR/../tmp/etcd.tmp;
				disown;
				for ((z=0;z<300;z++))
				do
					if grep -q " published " $DIR/../tmp/etcd.log; 
					then 
						echo "etcd startup finished."
						break; 
					fi;
					sleep 1
					if [ "$z" -ge "298" ] ; 
					then 
						echo "ERROR: etcd startup aborted. View membrane-api-mgr/tmp/etcd.log"
						exit 1
						break; 
					fi;
				done
	fi
}
stopetcd(){
	if [ -e $DIR/../tmp/etcd.tmp ]
		then
		echo "================================
shutting down etcd
================================"
			pkill -P $(cat $DIR/../tmp/etcd.tmp)
			kill $(cat $DIR/../tmp/etcd.tmp)
			rm $DIR/../tmp/etcd.tmp	
		else
				echo "================================
etcd is not started
================================"
	fi
}
startserviceproxy(){
	if [ -e $DIR/../tmp/service-proxy.tmp ]
		then
			echo "================================
service-proxy already started
================================"
		else
			$DIR/../membrane-service-proxy-4.2.1/service-proxy.sh -c ../conf/proxies.xml > $DIR/../tmp/service-proxy.log & echo "$!" > $DIR/../tmp/service-proxy.tmp;
			disown;
			for ((z=0;z<300;z++))
			do
				if grep -q "running" $DIR/../tmp/service-proxy.log; 
				then 
					echo "Membrane service-proxy startup finished."
					break; 
				fi;
				sleep 1
				if [ "$z" -ge "298" ] ; 
				then 
					echo "ERROR: Membrane service-proxy startup aborted. View membrane-api-mgr/tmp/service-proxy.log"
					exit 1
					break; 
				fi;
			done
	fi
}
stopserviceproxy(){
	if [ -e $DIR/../tmp/service-proxy.tmp ]
		then
		echo "================================
shutting down service-proxy
================================"
			pkill -P $(cat $DIR/../tmp/service-proxy.tmp)
			kill $(cat $DIR/../tmp/service-proxy.tmp)
			rm $DIR/../tmp/service-proxy.tmp
		else
			echo "================================
service-proxy is not started
================================"
	fi
}
startapimanagement(){
	if [ -e $DIR/../tmp/api-management.tmp ]
		then
			echo "================================
api-management already started
================================"
		else
			cd $DIR/../api-management ; meteor > $DIR/../tmp/meteor.log & echo "$!" > $DIR/../tmp/api-management.tmp;
			disown;
			cd $DIR;
			for ((z=0;z<300;z++))
			do
				if grep -q "Can" $DIR/../tmp/meteor.log; 
				then 
					echo "ERROR: Meteor could not be started. View membrane-api-mgr/tmp/meteor.log";
					break; 
				fi;
				if grep -q "running" $DIR/../tmp/meteor.log; 
				then 
					echo "Meteor startup finished."
					break; 
				fi;
				sleep 1
				if [ "$z" -ge "298" ] ; 
				then 
					echo "ERROR: Meteor startup aborted. View membrane-api-mgr/tmp/meteor.log"
					exit 1
					break; 
				fi;
			done
	fi
	
}
stopapimanagement(){
	if [ -e $DIR/../tmp/api-management.tmp ]
		then
			echo "================================
shutting down api-management
================================"
			kill $(cat $DIR/../tmp/api-management.tmp)
			rm $DIR/../tmp/api-management.tmp	
		else
			echo "================================
api-management is not started
================================"
	fi
}
if [ "$#" -ge "1" ] 
	then
		case "$1" in
			start) 	
			echo "======================================================================================
First startup might take a while because the meteor application needs to be initalised
======================================================================================"
					startetcd;
					startserviceproxy;
					startapimanagement;				
			    ;;
			startetcd)
					startetcd
					
				;;
			startserviceproxy)
					startserviceproxy
					
				;;
			startapimanagement)
					startapimanagement
					
				;;
			stop) 
					
				stopapimanagement
				stopserviceproxy
				stopetcd
				pkill -P $$
			    ;;
			stopetcd) stopetcd		
			    ;;
			stopserviceproxy) stopserviceproxy	
			    ;;
			stopapimanagement) stopapimanagement	
			    ;;
			*) help
			    ;;
		esac


	else
		help
fi

exit 0

 ' >./bin/api-management.sh
	chmod +x ./bin/api-management.sh
	echo "===============================================================================
start api-management by running ./membrane-api-mgr/bin/api-management.sh start

bye.
==============================================================================="
exit 0
}
main "$@"
