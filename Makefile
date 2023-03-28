SHELL := /bin/bash

# Image name
IMG_NAME := "vdolita/liveorderbooster"

build_img:
	@echo "Building image..."
	docker build -t $(IMG_NAME) .
	