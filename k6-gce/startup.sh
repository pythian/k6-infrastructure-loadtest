#!/bin/bash -v

sudo apt update

sudo apt upgrade -y

sudo apt install apt-transport-https \
     ca-certificates \
     curl \
     git \
     make \
     software-properties-common -y

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"

sudo apt update

sudo apt install docker-ce -y
