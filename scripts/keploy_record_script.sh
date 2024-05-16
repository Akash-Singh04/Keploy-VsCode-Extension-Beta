#!/bin/bash -i


folderpath="$2"
log_file_path="$1"

#command is all of the cli args after 2nd arg
command="${@:3}"

# Create log file if it doesn't exist
touch "$log_file_path"
> "$log_file_path" # Clear the log file

# Set permissions of the log file
chmod 666 "$log_file_path"

#try adding sudo here
#adding sudo here worked
keploycmd="sudo -E env PATH="$PATH" keploybin" 

# Check if keploy command is available in PATH

if command -v keploy &> /dev/null; then
    keploycmd="keploy"
fi

cd "$folderpath"
# Execute the keploy record command, redirecting output to the log file
sudo $keploycmd $command | tee -a "$log_file_path"
# $keploycmd  record -c "/home/akash/Desktop/samples-go/gin-mongo/test-app-url-shortener" | tee -a "$log_file_path" 


