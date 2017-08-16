
# Folders
CSS             :=css
JS              :=js
LIB             :=lib
TS              :=scripts
LANGFOLDER      :=languages
TESTS           :=$(TS)/tests

# Special files
INDEX           :=index.html
LIBSFILE        :=libs.txt
PRIORITYFILE    :=priority.txt
JSBASE          :=base.js
JSCOMPRESSED    :=main.js
JSTESTS         :=tests.js

COMPRESS        :=1

TSFILES         :=$(wildcard $(TS)/*.ts)
TSTESTFILES     :=$(wildcard $(TESTS)/*.ts)
ORIGNAMES       :=$(shell cat $(LIBSFILE) | sed "s/^\([^:]\+\): \(.*\)/\1/")
LIBNAMES        :=$(patsubst %, $(LIB)/%, $(ORIGNAMES))

.PHONY: all dirs libs languages machines raw simple tests

all: dirs libs languages machines
	@echo "[.ts ⟶ .js]"
	@if [ "$(TSFILES)" = "" ]; then \
		touch $(JS)/$(JSBASE); \
		truncate -s 0 $(JS)/$(JSBASE); \
	else\
		tsc --removeComments --noImplicitReturns --module amd --outFile $(JS)/$(JSBASE) $(TSFILES); \
	fi

	@if [ "$(COMPRESS)" = "1" ]; then \
		echo "[minifying] $(JS)/$(JSBASE) ⟶ $(JS)/$(JSCOMPRESSED)"; \
		uglifyjs $(JS)/$(JSBASE) --compress --mangle > $(JS)/$(JSCOMPRESSED) 2> /dev/null; \
	else\
		echo "[ copying ] $(JS)/$(JSBASE) ⟶ $(JS)/$(JSCOMPRESSED)"; \
		cp $(JS)/$(JSBASE) $(JS)/$(JSCOMPRESSED); \
	fi

	@rm $(JS)/$(JSBASE)

install:
	@npm install
	@node create_tables.js

run:
	@node app.js

tests: all
	@cp $(JS)/$(JSCOMPRESSED) $(JS)/$(JSTESTS)

dirs: | $(CSS) $(JS) $(LIB) $(TS)

libs: | $(LIBNAMES)

raw: COMPRESS :=0
raw: all

simple:
	@tsc --module amd --outFile $(JS)/$(JSBASE) $(TSFILES)
	@cp $(JS)/$(JSBASE) $(JS)/$(JSCOMPRESSED)

$(CSS) $(JS) $(LIB) $(TS):
	@echo "[  mkdir  ] $@"
	@mkdir -p $@

$(LIBNAMES):
	$(eval PURENAME=$(patsubst $(LIB)/%, %, $@))
	$(eval URL=$(shell cat $(LIBSFILE) | grep "^$(PURENAME):" | sed "s/^\([^:]\+\): \(.*\)/\2/"))
	@echo "[   lib   ] $(PURENAME)"
	@touch $@
	@wget -O $@ -q $(URL)