
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
FRONTENDMAIN      :=$(JS)/frontend/main.js
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

.PHONY: all install run tests dirs libs languages raw clean clean_all

all: dirs libs languages $(BACKENDMAIN) $(FRONTENDMAIN)

$(BACKENDMAIN): $(BACKENDFILES)
	@echo "[ backend ]"
	@echo "[.ts ⟶ .js] translating backend scripts"
	@if [ "$(BACKENDFILES)" != "" ]; then \
		tsc --removeComments --noImplicitReturns --outDir $(JS) $(BACKENDFILES); \
	fi

	@echo "[  alias  ] $(BACKENDFOLDER)$(BACKENDMAIN) ⟶ $(BACKENDMAIN)"
	@rm -f $(BACKENDMAIN)
	@ln -s $(BACKENDFOLDER)/$(BACKENDMAIN) $(BACKENDMAIN)

$(FRONTENDMAIN): $(FRONTENDFILES)
	@echo "[front end]"
	@mkdir -p $(JS)/frontend
	@touch $(JSBASE)
	@truncate -s 0 $(JSBASE)

	@echo "[.ts ⟶ .js] translating frontend scripts"
	@if [ "$(FRONTENDFILES)" != "" ]; then \
		tsc --removeComments --noImplicitReturns --module amd --outFile $(JSBASE) $(FRONTENDFILES); \
	fi

	@if [ "$(COMPRESS)" = "1" ]; then \
		echo "[minifying] $(JSBASE) ⟶ $(FRONTENDMAIN)"; \
		uglifyjs $(JSBASE) --compress --mangle > $(FRONTENDMAIN) 2> /dev/null; \
	else\
		echo "[ copying ] $(JSBASE) ⟶ $(FRONTENDMAIN)"; \
		cp $(JSBASE) $(FRONTENDMAIN); \
	fi

	@rm $(JSBASE)

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
