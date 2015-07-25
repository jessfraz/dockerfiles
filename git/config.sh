#!/bin/bash

#All repositories will reside in $_path directory
_path="/home/git/git_repos"

if [ ! -d $_path ]; then
    mkdir -p $_path
fi


host_name=`cat /etc/hostname`
GitProjects=("project1" "project2" "project3")

#Create bare repositories 
for i in "${GitProjects[@]}"
do
    mkdir -p "$_path/$i"
    git init --bare "$_path/$i/.git"

    printf '*%.0s' {1..50}
    echo -e "\nGit remote URL:\n\t git@$host_name:$_path/$i/.git\n"
    printf '*%.0s' {1..50}
done
