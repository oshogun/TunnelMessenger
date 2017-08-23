
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
BACKENDFOLDER   :=$(JS)/backend/
BACKENDMAIN     :=app.js
JSBASE          :=$(JS)/base.js
JSFRONTEND      :=$(JS)/frontend/main.js
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

.PHONY: all setup finish backend frontend install run tests	dirs libs languages raw clean clean_all

all: dirs libs languages setup backend frontend finish

setup:
	@touch $(JSBASE)

finish:
	@echo "[ cleanup ]"
	@rm $(JSBASE)

backend:
	@echo "[ backend ]"
	@echo "[.ts ⟶ .js] translating backend scripts"
	@truncate -s 0 $(JSBASE)
	@if [ "$(BACKENDFILES)" != "" ]; then \
		tsc --removeComments --noImplicitReturns --outDir $(JS) $(BACKENDFILES); \
	fi

	@echo "[  alias  ] $(BACKENDFOLDER)/$(BACKENDMAIN) ⟶ $(BACKENDMAIN)"a
	@rm -f $(BACKENDMAIN)
	@ln -s $(BACKENDFOLDER)/$(BACKENDMAIN) $(BACKENDMAIN)

frontend:
	@echo "[front end]"
	@mkdir -p $(JS)/frontend
	@echo "[.ts ⟶ .js] translating frontend scripts"
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
	@node $(BACKENDMAIN)

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
	@#" # syntax highlight fix
	@echo "[   lib   ] $(PURENAME)"
	@touch $@
	@wget -O $@ -q $(URL)

clean:
	@rm -rf js/*
	@rm $(BACKENDMAIN)

clean_all: clean
	@rm -rf node_modules
