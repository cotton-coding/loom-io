---
---

# Introduction

Nowadays there a lots of possible to store data, most application use sql like databases to handle there data. Loom-IO wants to go one step back, to classic files and also a lot of site generators go back to human readable files. At least there a still different formats and possibilities to store data: Git, Filesystem, S3, to just name some of them.

To make this simpler and more easily, this lib abstract this and offers different adapters for storing systems and file formats. It even give you the possibility to create your own ones to be 100% flexible.

## Modules

To solve this problem the lib is split in multiple parts, what seem to be more complex at the first view. To make this easier for you, there are some pre bundled modules. You will find them in the base section.

## Less dependencies

Loom-IO will be build with the philosophy to avoid dependencies to other libraries, to reduce your risk of unknown dependencies. At least we wouldn't reinvent the wheel and implement everything at our own, so for example the YAML-Adapter is based on a other parsing library, but at least it is your decision to use it, implement your own or just a other one based on a other library.
