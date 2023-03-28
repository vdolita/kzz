SHELL := /bin/bash

# Image name
IMG_NAME := "vdolita/liveorderbooster"

build_img:
	@echo "Building image..."
	docker build --platform linux/amd64 -t $(IMG_NAME) .
	