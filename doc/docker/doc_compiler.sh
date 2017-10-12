#!/usr/bin/env bash

echo "Building documentation"

SRC_FOLDER=/opt/imptime/to_compile
DOC_FOLDER=${SRC_FOLDER}/doc

cd ${DOC_FOLDER}
gitbook build
gitbook pdf . imptime_doc.pdf

echo "Done"
