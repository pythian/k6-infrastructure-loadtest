#!/bin/bash

# Drop this file into /etc/profile.d for easy setup of multiple load test users

if [[ -z $(groups | grep docker) ]]; then
    sudo usermod -a -G docker $(whoami)
    echo "Please log out and back in to update group membership and execute .profile updates."
    exit 0
fi

if [[ -z $(cat ~/.profile | grep "# Configure SSH for GitHub") ]]; then
    ssh-keygen -t rsa -N "" -f ~/.ssh/id_rsa_github
    chmod 600 ~/.ssh/id_rsa_github
    cat >> ~/.profile << EOT

# Configure SSH for GitHub
if [ -f ~/.ssh/id_rsa_github ] ; then
eval `ssh-agent`
ssh-add ~/.ssh/id_rsa_github
fi
EOT

    echo "Please add ~/.ssh/id_rsa_github.pub to your github account settings as an auth key."
    exit 0

fi
