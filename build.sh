#!/bin/bash
set -e
# init submodule (theme)
git submodule update --init --recursive

# patch: theme uses avif but zola binary doesn't support it
sed -i 's/format="avif"/format="webp"/g' themes/jiaxiang-wang/templates/shortcodes/image.html
sed -i 's/format="avif"/format="webp"/g' themes/jiaxiang-wang/templates/_macros.html
sed -i 's/format="avif"/format="webp"/g' themes/jiaxiang-wang/templates/partial/nav/loading-box.html

curl -sL https://github.com/getzola/zola/releases/download/v0.19.2/zola-v0.19.2-x86_64-unknown-linux-gnu.tar.gz | tar xz
./zola build
