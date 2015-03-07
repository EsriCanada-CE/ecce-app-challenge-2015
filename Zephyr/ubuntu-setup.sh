#!/bin/bash

sudo apt-get update
sudo apt-get -y install curl git maven openjdk-7-jdk libicu-dev build-essential

git clone https://github.com/creationix/nvm.git ~/.nvm && cd ~/.nvm && git checkout `git describe --abbrev=0 --tags`

echo 'source ~/.nvm/nvm.sh' >> ~/.bashrc
echo 'export JAVA_HOME=/usr/lib/jvm/java-1.7.0-openjdk-amd64' >> ~/.bashrc

source ~/.nvm/nvm.sh
nvm install iojs-v1.3
nvm alias default iojs-v1.3

cd ~
git clone https://github.com/cambecc/grib2json.git
git clone https://github.com/fivehourshower/Zephyr.git

cd grib2json
mvn package
tar -xvzf target/grib2json-0.8.0-SNAPSHOT.tar.gz
echo 'export PATH=$PATH:~/grib2json/grib2json-0.8.0-SNAPSHOT/bin' >> ~/.bashrc

cd ~/Zephyr
npm install
npm run sync
npm run start
