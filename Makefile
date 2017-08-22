
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
JSBASE          :=$(JS)/base.js
JSBACKEND       :=app.js
JSFRONTEND      :=$(JS)/main.js
JSTESTS         :=tests.js

COMPRESS        :=0

SHAREDFILES     :=$(wildcard $(TS)/shared/*.ts)
BACKENDFILES    :=$(wildcard $(TS)/backend/*.ts)
FRONTENDFILES   :=$(wildcard $(TS)/frontend/*.ts)
TSTESTFILES     :=$(wildcard $(TESTS)/*.ts)
ORIGNAMES       :=$(shell cat $(LIBSFILE) | sed "s/^\([^:]\+\): \(.*\)/\1/")
LIBNAMES        :=$(patsubst %, $(LIB)/%, $(ORIGNAMES))

BACKENDFILES += $(SHAREDFILES)
FRONTENDFILES += $(SHAREDFILES)

.PHONY: all dirs libs languages raw simple tests

all: dirs libs languages setup frontend backend finish

setup:
	@touch $(JSBASE)

finish:
	@echo "[ cleanup ]"
	@rm $(JSBASE)

backend:
	@echo "[ backend ]"
	@echo "[.ts ⟶ .js]"
	@truncate -s 0 $(JSBASE)
	@if [ "$(BACKENDFILES)" != "" ]; then \
		tsc --removeComments --noImplicitReturns --module amd --outFile $(JSBASE) $(BACKENDFILES); \
	fi

	@if [ "$(COMPRESS)" = "1" ]; then \
		echo "[minifying] $(JSBASE) ⟶ $(JSBACKEND)"; \
		uglifyjs $(JSBASE) --compress --mangle > $(JSBACKEND) 2> /dev/null; \
	else\
		echo "[ copying ] $(JSBASE) ⟶ $(JSBACKEND)"; \
		cp $(JSBASE) $(JSBACKEND); \
	fi

frontend:
	@echo "[front end]"
	@echo "[.ts ⟶ .js]"
	@truncate -s 0 $(JSBASE)
	@if [ "$(FRONTENDFILES)" != "" ]; then \
		tsc --removeComments --noImplicitReturns --module amd --outFile $(JSBASE) $(FRONTENDFILES); \
	fi

	@if [ "$(COMPRESS)" = "1" ]; then \
		echo "[minifying] $(JSBASE) ⟶ $(JSFRONTEND)"; \
		uglifyjs $(JSBASE) --compress --mangle > $(JSFRONTEND) 2> /dev/null; \
	else\
		echo "[ copying ] $(JSBASE) ⟶ $(JSFRONTEND)"; \
		cp $(JSBASE) $(JSFRONTEND); \
	fi

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

$(CSS) $(JS) $(LIB) $(TS):
	@echo "[  mkdir  ] $@"
	@mkdir -p $@

$(LIBNAMES):
	$(eval PURENAME=$(patsubst $(LIB)/%, %, $@))
	$(eval URL=$(shell cat $(LIBSFILE) | grep "^$(PURENAME):" | sed "s/^\([^:]\+\): \(.*\)/\2/"))
	@echo "[   lib   ] $(PURENAME)"
	@touch $@
	@wget -O $@ -q $(URL)