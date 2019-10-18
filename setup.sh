#!/bin/bash

if which node > /dev/null
  then
    echo 'Node is installed, skipping...'
  else
    echo 'Installing node.'
    curl -Ls install-node.now.sh | sh
  fi

if which yarn > /dev/null
  then
    echo 'Installing yarn.'
    echo 'Yarn is installed, skipping...'
  else
    curl -o- -L https://yarnpkg.com/install.sh | bash
  fi

