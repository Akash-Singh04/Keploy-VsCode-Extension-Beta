#!/bin/bash -i

folderpath="$2"
log_file_path="$1"

# Command is all of the CLI args after the 2nd arg
command="${@:3}"

# Create log file if it doesn't exist
touch "$log_file_path"
> "$log_file_path" # Clear the log file

# Set permissions of the log file
chmod 666 "$log_file_path"

if [[ "$command" =~ .*"go".* ]]; then
#   echo "Go is present."
  go mod download
  go build -o application
fi 

keploycmd="sudo -E env PATH=\"$PATH\" keploybin"


cd "$folderpath"

# Create a named pipe
fifo=$(mktemp -u)
mkfifo "$fifo"

# Background process to read from the named pipe and write to the log file
cat "$fifo" | tee -a "$log_file_path" &
cat_pid=$!

# Dummy background process to keep the parent script running
(while true; do sleep 1; done) &
dummy_pid=$!

# Execute the keploy command, redirecting output to the named pipe
echo $keploycmd test -c "$command"
sudo $keploycmd test -c "$command" > "$fifo" 2>&1

# Clean up: Wait for keploy command to finish
wait $!

# Terminate the dummy process and the logging process
kill $dummy_pid
wait $cat_pid
rm "$fifo"
