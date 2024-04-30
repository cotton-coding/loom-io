---
title: Introduction
description: It doesn't matter what kind of file storage you're using. Loom-IO gives you an API that lets you handle them all the same way, so you can access them more easily.
---

# Introduction

These days, there are lots of ways to store data. Most apps use SQL databases to handle their data. Loom-IO wants to go back to the basics, to classic files. Many site generators also go back to human-readable files. There are still different formats and possibilities to store data: Git, file systems, S3, and so on.

To make things simpler and easier, this library abstracts this and offers different adapters for storing systems and file formats. You can even create your own to be 100% flexible.

## Less dependencies

Loom-IO will be built with the philosophy to avoid dependencies to other libraries, to reduce your risk of unknown dependencies.

At least we wouldn't have to reinvent the wheel and implement everything from scratch, so for example the YAML adapter is based on another parsing library, but it's up to you to decide whether to use it, implement your own or just use another one based on another library.

## Contributing

This project is hosted on GitHub (https://github.com/cotton-coding/loom-io), where you'll also find this documentation (https://github.com/cotton-coding/loom-io/tree/main/documentation). Please feel free to improve it by creating a pull request.
