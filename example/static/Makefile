build:
	google/closure-library/closure/bin/calcdeps.py -i js/src/example/ExampleChat.js	-p google/closure-library/closure -o script > js/compiled.js
compile:
	google/closure-library/closure/bin/calcdeps.py -i js/src/example/ExampleChat.js	-p google/closure-library/closure -o script > js/uncompiled.js
	java -jar google/compiler.jar --flagfile flagfile.txt  --js js/uncompiled.js --js_output_file js/compiled.js
