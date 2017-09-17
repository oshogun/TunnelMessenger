
# Folders
CSS             :=css
JS              :=js
LIB             :=lib
TS              :=scripts
TESTS           :=$(TS)/tests
DEFS            :=$(TS)/defs
BACKENDFOLDER   :=backend
FRONTENDFOLDER  :=frontend
SHAREDFOLDER    :=shared
BACKENDJS       :=$(JS)/$(BACKENDFOLDER)
FRONTENDJS      :=$(JS)/$(FRONTENDFOLDER)
SHAREDJS        :=$(JS)/$(SHAREDFOLDER)
BACKENDTS       :=$(TS)/$(BACKENDFOLDER)
FRONTENDTS      :=$(TS)/$(FRONTENDFOLDER)
SHAREDTS        :=$(TS)/$(SHAREDFOLDER)

# Special files
INDEX           :=index.html
DEFSFILE        :=defs.txt
LIBSFILE        :=libs.txt
BACKENDMAIN     :=app.js
JSBASE          :=$(JS)/base.js
FRONTENDMAIN    :=$(FRONTENDJS)/main.js
JSTESTS         :=tests.js

COMPRESS        :=0

SHAREDFILES     :=$(shell find $(SHAREDTS) -mindepth 1 -name "*.ts")
BACKENDFILES    :=$(shell find $(BACKENDTS) -mindepth 1 -name "*.ts")
FRONTENDFILES   :=$(shell find $(FRONTENDTS) -mindepth 1 -name "*.ts")
# TSTESTFILES     :=$(shell find $(TESTS) -mindepth 1 -name "*.ts")
ORIGDEFNAMES    :=$(shell cat $(DEFSFILE) | sed "s/^\([^:]\+\): \(.*\)/\1/")
ORIGLIBNAMES    :=$(shell cat $(LIBSFILE) | sed "s/^\([^:]\+\): \(.*\)/\1/")
DEFNAMES        :=$(patsubst %, $(DEFS)/%, $(ORIGDEFNAMES))
LIBNAMES        :=$(patsubst %, $(LIB)/%, $(ORIGLIBNAMES))

BACKENDFILES += $(SHAREDFILES)
FRONTENDFILES += $(SHAREDFILES)

.PHONY: all install run tests dirs libs raw clean clean_all

all: dirs defs libs $(FRONTENDMAIN)

$(BACKENDMAIN): $(BACKENDFILES)
	@echo "[ backend ]"
	@echo "[.ts ⟶ .js] translating backend scripts"
	@if [ "$(BACKENDFILES)" != " " ]; then \
		tsc --strictNullChecks --removeComments --noImplicitReturns --outDir $(JS) $(BACKENDFILES); \
	else \
		touch $(BACKENDJS)/$(BACKENDMAIN); \
	fi

	@echo "[  alias  ] $(BACKENDJS)/$(BACKENDMAIN) ⟶ $(BACKENDMAIN)"
	@ln -sf $(BACKENDJS)/$(BACKENDMAIN) $(BACKENDMAIN)
	@touch $(BACKENDMAIN)

$(FRONTENDMAIN): $(FRONTENDFILES)
	@echo "[front end]"
	@touch $(JSBASE)
	@truncate -s 0 $(JSBASE)

	@echo "[.ts ⟶ .js] translating frontend scripts"
	@if [ "$(FRONTENDFILES)" != " " ]; then \
		tsc --strictNullChecks --removeComments --noImplicitReturns --module amd --outFile $(JSBASE) $(FRONTENDFILES); \
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

run:
	@node $(BACKENDMAIN)

tests: all
	@cp $(JS)/$(JSCOMPRESSED) $(JS)/$(JSTESTS)

dirs: | $(CSS) $(JS) $(LIB) $(TS) $(BACKENDTS) $(FRONTENDTS) $(SHAREDTS) $(BACKENDJS) $(FRONTENDJS) $(SHAREDJS)

defs: | $(DEFNAMES)

libs: | $(LIBNAMES)

raw: COMPRESS :=0
raw: all

$(CSS) $(JS) $(LIB) $(TS) $(BACKENDTS) $(FRONTENDTS) $(SHAREDTS) $(BACKENDJS) $(FRONTENDJS) $(SHAREDJS) $(TESTS) $(DEFS):
	@echo "[  mkdir  ] $@"
	@mkdir -p $@

$(LIBNAMES):
	$(eval PURENAME=$(patsubst $(LIB)/%, %, $@))
	$(eval URL=$(shell cat $(LIBSFILE) | grep "^$(PURENAME):" | sed "s/^\([^:]\+\): \(.*\)/\2/"))
	@#" # syntax highlight fix
	@echo "[   lib   ] $(PURENAME)"
	@touch $@
	@wget -O $@ -q $(URL)

$(DEFNAMES): | $(TS)/defs
	$(eval PURENAME=$(patsubst $(DEFS)/%, %, $@))
	$(eval URL=$(shell cat $(DEFSFILE) | grep "^$(PURENAME):" | sed "s/^\([^:]\+\): \(.*\)/\2/"))
	@#" # syntax highlight fix
	@echo "[   def   ] $(PURENAME)"
	@touch $@
	@wget -O $@ -q $(URL)

clean:
	@rm -rf js/*
	@rm -f $(BACKENDMAIN)

clean_all: clean
	@rm -rf $(DEFS)/*
	@rm -rf node_modules
